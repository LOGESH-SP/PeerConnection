import { User, Doubt, Answer } from '../types';

const API_URL = 'http://localhost:5000/api';

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
    return data.data;
  },

  getUserProfile: async (): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/profile`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message);
    return data.data;
  },

  // --- DOUBTS ---
  getDoubts: async (tags?: string[], status?: 'solved' | 'unsolved'): Promise<Doubt[]> => {
    let url = `${API_URL}/doubts`;
    const params = new URLSearchParams();
    if (tags && tags.length > 0) params.append('tags', tags.join(','));
    if (status) params.append('status', status);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message);
    return data.data;
  },

  postDoubt: async (userId: number, formData: any, options: any): Promise<any> => {
    const res = await fetch(`${API_URL}/doubts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        title: formData.title,
        description: formData.content, // mapped content to description
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
    if (!res.ok || !data.success) throw new Error(data.message);
    return data.data;
  },

  postAnswer: async (userId: number, requestData: any): Promise<any> => {
    const { doubtId, answerData } = requestData;
    const res = await fetch(`${API_URL}/answers/${doubtId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        step1: answerData.step1,
        step2: answerData.step2,
        step3: answerData.step3
      })
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

  // --- FILES ---
  uploadFile: async (file: File): Promise<string> => {
    // For now, return a dummy string or setup multipart/form-data to the backend
    return URL.createObjectURL(file); 
  }
};

// Aliasing for easy component migration
export const academicDb = apiService;
