export type UserRole = 'CLIENT' | 'PROVIDER';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  clientProfile?: ClientProfile;
  providerProfile?: ProviderProfile;
}

export interface ClientProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  clinicName?: string;
  licenseNumber?: string;
  phone?: string;
  address?: string;
}

export interface IntakeForm {
  id: string;
  caseHistoryId: string;
  presentingProblem?: string;
  medicalHistory?: string;
  mentalHealthHistory?: string;
  medications?: string;
  consentAcknowledged: boolean;
  freeTextNotes?: string;
  providerNotes?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface SessionLog {
  id: string;
  caseHistoryId: string;
  providerId: string;
  clientId: string;
  sessionDate: string;
  presentingTopics?: string;
  therapistObservations?: string;
  clientAffect?: string;
  interventionsUsed?: string;
  progressNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseHistory {
  id: string;
  clientId: string;
  providerId: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    email: string;
    clientProfile?: {
      firstName?: string;
      lastName?: string;
    };
  };
  provider?: {
    id: string;
    email: string;
    providerProfile?: {
      firstName?: string;
      lastName?: string;
      clinicName?: string;
    };
  };
  intakeForm?: IntakeForm;
  sessionLogs?: SessionLog[];
}
