import axios from 'axios';
import { User, CaseHistory, IntakeForm, SessionLog } from '../types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export interface SignupData {
  email: string;
  password: string;
  role: 'CLIENT' | 'PROVIDER';
  firstName?: string;
  lastName?: string;
  clinicName?: string;
  licenseNumber?: string;
}

export interface LoginData {
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

export interface UpdateProviderNotesData {
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

// Auth API
export const authAPI = {
  signup: async (data: SignupData) => {
    const response = await api.post<{ message: string; user: User }>('/auth/signup', data);
    return response.data;
  },
  login: async (data: LoginData) => {
    const response = await api.post<{ message: string; user: User }>('/auth/login', data);
    return response.data;
  },
  logout: async () => {
    const response = await api.post<{ message: string }>('/auth/logout');
    return response.data;
  },
  getMe: async () => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  },
};

// Case History API
export const caseHistoryAPI = {
  getAll: async () => {
    const response = await api.get<{ caseHistories: CaseHistory[] }>('/case-histories');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<{ caseHistory: CaseHistory }>(`/case-histories/${id}`);
    return response.data;
  },
  create: async (data: IntakeFormData) => {
    const response = await api.post<{ caseHistory: CaseHistory }>('/case-histories', data);
    return response.data;
  },
  updateProviderNotes: async (id: string, data: UpdateProviderNotesData) => {
    const response = await api.patch<{ intakeForm: IntakeForm }>(`/case-histories/${id}/intake-form`, data);
    return response.data;
  },
};

// Session Log API
export const sessionLogAPI = {
  create: async (data: SessionLogData) => {
    const response = await api.post<{ sessionLog: SessionLog }>('/session-logs', data);
    return response.data;
  },
  getByCaseHistory: async (caseHistoryId: string) => {
    const response = await api.get<{ sessionLogs: SessionLog[] }>(`/session-logs?caseHistoryId=${caseHistoryId}`);
    return response.data;
  },
};

export default api;
