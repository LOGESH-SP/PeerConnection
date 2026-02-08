
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

export interface Doubt {
  id: number;
  userId: number;
  username: string;
  title: string;
  content: string;
  category: string;
  isAnonymous: boolean;
  createdAt: string;
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
