import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, SessionLogData } from '../types';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateSessionLog, handleValidationErrors } from '../utils/validation';

const router = Router();
const prisma = new PrismaClient();

// Create a new session log (PROVIDER only)
router.post('/', authenticateToken, requireRole(['PROVIDER']), validateSessionLog, handleValidationErrors, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { caseHistoryId, sessionDate, presentingTopics, therapistObservations, clientAffect, interventionsUsed, progressNotes }: SessionLogData = req.body;

    // Verify case history exists and belongs to this provider
    const caseHistory = await prisma.caseHistory.findUnique({
      where: { id: caseHistoryId },
    });

    if (!caseHistory) {
      return res.status(404).json({ error: 'Case history not found' });
    }

    if (caseHistory.providerId !== req.userId) {
      return res.status(403).json({ error: 'Access denied. You can only create session logs for your assigned cases.' });
    }

    // Create session log
    const sessionLog = await prisma.sessionLog.create({
      data: {
        caseHistoryId,
        providerId: req.userId,
        clientId: caseHistory.clientId,
        sessionDate: sessionDate ? new Date(sessionDate) : new Date(),
        presentingTopics,
        therapistObservations,
        clientAffect,
        interventionsUsed,
        progressNotes,
      },
    });

    res.status(201).json({ sessionLog });
  } catch (error) {
    console.error('Create session log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get session logs for a case history
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId || !req.userRole) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { caseHistoryId } = req.query;

    if (!caseHistoryId || typeof caseHistoryId !== 'string') {
      return res.status(400).json({ error: 'caseHistoryId query parameter is required' });
    }

    // Verify case history exists and user has access
    const caseHistory = await prisma.caseHistory.findUnique({
      where: { id: caseHistoryId },
    });

    if (!caseHistory) {
      return res.status(404).json({ error: 'Case history not found' });
    }

    // Enforce access control
    if (req.userRole === 'CLIENT' && caseHistory.clientId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.userRole === 'PROVIDER' && caseHistory.providerId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Fetch session logs
    const sessionLogs = await prisma.sessionLog.findMany({
      where: { caseHistoryId },
      orderBy: { sessionDate: 'desc' },
    });

    res.json({ sessionLogs });
  } catch (error) {
    console.error('Get session logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
