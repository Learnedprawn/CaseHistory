import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, IntakeFormData, UpdateIntakeFormData } from '../types';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateIntakeForm, validateProviderNotes, handleValidationErrors } from '../utils/validation';

const router = Router();
const prisma = new PrismaClient();

// Get all case histories for the authenticated user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId || !req.userRole) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let caseHistories;

    if (req.userRole === 'PROVIDER') {
      // Providers see all cases assigned to them
      caseHistories = await prisma.caseHistory.findMany({
        where: { providerId: req.userId },
        include: {
          client: {
            select: {
              id: true,
              email: true,
              clientProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          intakeForm: true,
          sessionLogs: {
            orderBy: { sessionDate: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Clients see only their own cases
      caseHistories = await prisma.caseHistory.findMany({
        where: { clientId: req.userId },
        include: {
          provider: {
            select: {
              id: true,
              email: true,
              providerProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                  clinicName: true,
                },
              },
            },
          },
          intakeForm: true,
          sessionLogs: {
            orderBy: { sessionDate: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.json({ caseHistories });
  } catch (error) {
    console.error('Get case histories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single case history by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId || !req.userRole) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const caseHistory = await prisma.caseHistory.findUnique({
      where: { id: req.params.id },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            clientProfile: true,
          },
        },
        provider: {
          select: {
            id: true,
            email: true,
            providerProfile: true,
          },
        },
        intakeForm: true,
        sessionLogs: {
          orderBy: { sessionDate: 'desc' },
        },
      },
    });

    if (!caseHistory) {
      return res.status(404).json({ error: 'Case history not found' });
    }

    // Enforce access control: clients can only see their own, providers can see assigned cases
    if (req.userRole === 'CLIENT' && caseHistory.clientId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.userRole === 'PROVIDER' && caseHistory.providerId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ caseHistory });
  } catch (error) {
    console.error('Get case history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new case history with intake form (CLIENT only)
router.post('/', authenticateToken, requireRole(['CLIENT']), validateIntakeForm, handleValidationErrors, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const intakeData: IntakeFormData = req.body;

    // For MVP: assign to first available provider
    // In production: implement provider selection/assignment logic
    const provider = await prisma.user.findFirst({
      where: { role: 'PROVIDER' },
    });

    if (!provider) {
      return res.status(400).json({ error: 'No provider available. Please contact support.' });
    }

    // Create case history and intake form in transaction
    const caseHistory = await prisma.$transaction(async (tx) => {
      const newCaseHistory = await tx.caseHistory.create({
        data: {
          clientId: req.userId!,
          providerId: provider.id,
        },
      });

      const intakeForm = await tx.intakeForm.create({
        data: {
          caseHistoryId: newCaseHistory.id,
          presentingProblem: intakeData.presentingProblem,
          medicalHistory: intakeData.medicalHistory,
          mentalHealthHistory: intakeData.mentalHealthHistory,
          medications: intakeData.medications,
          consentAcknowledged: intakeData.consentAcknowledged,
          freeTextNotes: intakeData.freeTextNotes,
        },
      });

      return { ...newCaseHistory, intakeForm };
    });

    res.status(201).json({ caseHistory });
  } catch (error) {
    console.error('Create case history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update intake form provider notes (PROVIDER only)
router.patch('/:id/intake-form', authenticateToken, requireRole(['PROVIDER']), validateProviderNotes, handleValidationErrors, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { providerNotes }: UpdateIntakeFormData = req.body;

    // Verify case history exists and belongs to this provider
    const caseHistory = await prisma.caseHistory.findUnique({
      where: { id: req.params.id },
    });

    if (!caseHistory) {
      return res.status(404).json({ error: 'Case history not found' });
    }

    if (caseHistory.providerId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update only provider notes - clients cannot edit their responses after submission
    const intakeForm = await prisma.intakeForm.update({
      where: { caseHistoryId: req.params.id },
      data: { providerNotes },
    });

    res.json({ intakeForm });
  } catch (error) {
    console.error('Update intake form error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
