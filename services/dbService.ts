import { User, Doubt, Answer } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('doubt_app_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const apiService = {
  // --- AUTHENTICATION ---
  login: async (email: string, password?: string, isSignUp?: boolean): Promise<User> => {
    const endpoint = isSignUp ? '/auth/register' : '/auth/login';
    const body = isSignUp 
      ? JSON.stringify({ email, password, username: email.split('@')[0], role: 'STUDENT' }) 
      : JSON.stringify({ email, password });

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Authentication failed');
    }

    localStorage.setItem('doubt_app_token', data.data.token);
    return data.data; // Includes token and user data
  },

  getUserProfile: async (): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/profile`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message);
    return data.data;
  },

  getLeaderboard: async (): Promise<User[]> => {
    const res = await fetch(`${API_URL}/auth/leaderboard`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok || !data.success) return [];
    return data.data;
  },

  // --- DOUBTS ---
  getDoubts: async (tags?: string[], status?: 'solved' | 'unsolved', mode: 'latest' | 'personalized' | 'unsolved' = 'latest'): Promise<Doubt[]> => {
    let url = `${API_URL}/doubts`;
    const params = new URLSearchParams();
    if (tags && tags.length > 0) params.append('tags', tags.join(','));
    if (status) params.append('status', status);
    params.append('mode', mode);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: getHeaders() });
    const data = await res.json();
    return data.success ? data.data : [];
  },

  getSavedDoubts: async (): Promise<Doubt[]> => {
    const res = await fetch(`${API_URL}/doubts/saved`, { headers: getHeaders() });
    const data = await res.json();
    return data.success ? data.data : [];
  },

  saveDoubt: async (doubtId: string | number): Promise<boolean> => {
    const res = await fetch(`${API_URL}/doubts/${doubtId}/save`, { 
        method: 'POST',
        headers: getHeaders() 
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message);
    return data.data.isSaved;
  },

  postDoubt: async (userId: number, formData: any, options: any): Promise<any> => {
    const res = await fetch(`${API_URL}/doubts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        title: formData.title,
        description: formData.content, // mapped to backend schema
        category: formData.category,
        tags: formData.tags || []
      })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message);
    return { similarityFound: false, doubt: data.data };
  },

  // --- ANSWERS ---
  getAnswers: async (doubtId: string | number): Promise<Answer[]> => {
    const res = await fetch(`${API_URL}/answers/${doubtId}`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok || !data.success) return [];
    
    // Calculate trust scores locally if backend didn't supply them yet, 
    // or rely on backend data (Phase 2).
    return data.data;
  },

  postAnswer: async (userId: number, doubtId: number, formData: any): Promise<any> => {
    const res = await fetch(`${API_URL}/answers/${doubtId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        step1: formData.step1,
        step2: formData.step2,
        step3: formData.step3
      })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message);
    return data.data;
  },

  verifyAnswer: async (answerId: number, verifierId: number): Promise<any> => {
    const res = await fetch(`${API_URL}/answers/${answerId}/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ verifierId })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message);
    return data.data;
  },

  // --- FEEDBACK & TRUST SCORE (PHASE 2) ---
  postFeedback: async (answerId: number | string, isHelpful: boolean): Promise<any> => {
    const res = await fetch(`${API_URL}/answers/${answerId}/feedback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ isHelpful })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message);
    return data.data;
  },

  flagAnswer: async (answerId: number | string, reason: string): Promise<any> => {
    const res = await fetch(`${API_URL}/answers/${answerId}/flag`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message);
    return data.data;
  },

  recheckAnswer: async (answerId: number | string): Promise<any> => {
    const res = await fetch(`${API_URL}/answers/${answerId}/recheck`, {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message);
    return data.data;
  },

  // --- FILES ---
  uploadFile: async (file: File): Promise<string> => {
    // Return a dummy string for local prototype
    return URL.createObjectURL(file); 
  },

  // --- NOTIFICATIONS ---
  getNotifications: async (userId: number | string): Promise<any[]> => {
    try {
      const res = await fetch(`${API_URL}/notifications`, { headers: getHeaders() });
      const data = await res.json();
      return data.success ? data.data : [];
    } catch {
      return [];
    }
  },

  markNotificationsRead: async (userId: number | string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/notifications/read`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  },

  // --- MESSAGES ---
  getMessages: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_URL}/messages`, { headers: getHeaders() });
      const data = await res.json();
      return data.success ? data.data : [];
    } catch (err) {
      throw err;
    }
  },

  sendMessage: async (userId: number | string, content: string): Promise<any> => {
    const res = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message);
    return data.data;
  },

  // --- SYSTEM ---
  checkDatabaseStatus: async (): Promise<any> => {
    try {
      const res = await fetch(`${API_URL}/system/db-status`, { headers: getHeaders() });
      const data = await res.json();
      return data.success ? data.data : [];
    } catch {
      return [];
    }
  }
};

export const academicDb = apiService;
