import { Request } from 'express';

export type UserRole = 'CLIENT' | 'PROVIDER';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: UserRole;
}

export interface SignupBody {
  email: string;
  password: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  clinicName?: string;
  licenseNumber?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface IntakeFormData {
  presentingProblem?: string;
  medicalHistory?: string;
  mentalHealthHistory?: string;
  medications?: string;
  consentAcknowledged: boolean;
  freeTextNotes?: string;
}

export interface UpdateIntakeFormData {
  providerNotes?: string;
}

export interface SessionLogData {
  caseHistoryId: string;
  sessionDate?: string;
  presentingTopics?: string;
  therapistObservations?: string;
  clientAffect?: string;
  interventionsUsed?: string;
  progressNotes?: string;
}
