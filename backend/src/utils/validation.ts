import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('role')
    .isIn(['CLIENT', 'PROVIDER'])
    .withMessage('Role must be CLIENT or PROVIDER'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const validateIntakeForm = [
  body('consentAcknowledged')
    // Accept boolean true or the string "true" (common when some clients submit form-ish payloads).
    // We coerce to boolean before checking to ensure Prisma receives a real boolean.
    .exists()
    .withMessage('Consent must be acknowledged')
    .bail()
    .toBoolean()
    .isBoolean()
    .bail()
    .custom((v) => v === true)
    .withMessage('Consent must be acknowledged'),
  body('presentingProblem')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Presenting problem must be less than 5000 characters'),
  body('medicalHistory')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Medical history must be less than 5000 characters'),
  body('mentalHealthHistory')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Mental health history must be less than 5000 characters'),
  body('medications')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Medications must be less than 2000 characters'),
  body('freeTextNotes')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Free text notes must be less than 10000 characters'),
];

export const validateProviderNotes = [
  body('providerNotes')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Provider notes must be less than 10000 characters'),
];

export const validateSessionLog = [
  body('caseHistoryId')
    .notEmpty()
    .withMessage('Case history ID is required'),
  body('sessionDate')
    .optional()
    .isISO8601()
    .withMessage('Session date must be a valid date'),
  body('presentingTopics')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Presenting topics must be less than 5000 characters'),
  body('therapistObservations')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Therapist observations must be less than 10000 characters'),
  body('clientAffect')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Client affect must be less than 2000 characters'),
  body('interventionsUsed')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Interventions used must be less than 5000 characters'),
  body('progressNotes')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Progress notes must be less than 10000 characters'),
];

export function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}
