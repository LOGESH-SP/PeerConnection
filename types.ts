
export enum UserRole {
  STUDENT = 'STUDENT',
  MENTOR = 'MENTOR',
  ADMIN = 'ADMIN'
}

export interface User {
  id: number;
  username: string;
  role: UserRole;
  credibilityScore: number;
  dailyLimit: number;
  doubtsPostedToday: number;
}

export interface Attachment {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'pdf' | 'doc' | 'voice';
}

export interface Doubt {
  id: number;
  userId: number;
  username: string;
  title: string;
  content: string; // Used for description historically in UI
  category: string;
  isAnonymous: boolean;
  createdAt: string;
  attachments?: Attachment[];
  answers_count?: number;
  status?: 'Solved' | 'Unsolved';
  isSaved?: boolean;
}

export interface Answer {
  id: number;
  doubtId: number;
  userId: number;
  username: string;
  step1: string;
  step2: string;
  step3: string;
  isVerified: boolean;
  createdAt: string;
  attachments?: Attachment[];
  trustScore?: number;
  is_best_answer?: boolean;
  is_best_answer_computed?: boolean;
  is_under_review?: boolean;
  upvotes?: number;
  downvotes?: number;
  ai_confidence?: number;
  last_reviewed?: string;
  version_history?: any[];
}

export interface AppNotification {
  id: number;
  userId: number;
  message: string;
  type: 'NEW_ANSWER' | 'VERIFIED';
  isRead: boolean;
  createdAt: string;
  doubtId?: number;
}

export interface DailyLimitRecord {
  userId: number;
  date: string;
  count: number;
  bonus: number;
}

export interface ChatMessage {
  id: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}
