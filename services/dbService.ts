
import { Doubt, Answer, User, UserRole, AppNotification } from '../types';
import { supabase } from './supabaseClient';

/**
 * UNIVERSITY LAB SERVICE LAYER
 * Integrates with Supabase for real-time persistence.
 * Falls back to LocalStorage if Supabase is not configured.
 */
class AcademicDatabaseService {
  private STORAGE_KEY = 'peerconnect_db_v10';
  private useSupabase = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  constructor() {
    if (!this.useSupabase) {
      this.initializeMock();
    }
  }

  private async simulateNetwork() {
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400));
  }

  private initializeMock() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.saveMock({
        users: [
          { id: 1, username: 'admin', role: UserRole.ADMIN, credibilityScore: 999 },
          { id: 2, username: 'mentor_john', role: UserRole.MENTOR, credibilityScore: 250 },
          { id: 3, username: 'student_alice', role: UserRole.STUDENT, credibilityScore: 145 },
          { id: 4, username: 'student_bob', role: UserRole.STUDENT, credibilityScore: 85 }
        ],
        doubts: [
          {
            id: 101,
            userId: 2,
            username: 'mentor_john',
            title: 'Newton-Raphson Convergence Proof',
            content: 'How do we derive the quadratic convergence for the Newton-Raphson method?',
            category: 'Numerical Methods',
            isAnonymous: false,
            createdAt: new Date().toISOString()
          },
          {
            id: 102,
            userId: 3,
            username: 'student_alice',
            title: 'NP-Hard vs NP-Complete Logic',
            content: 'I am struggling to differentiate between NP-Hard and NP-Complete problems in DAA.',
            category: 'Design and Analysis of Algorithms',
            isAnonymous: false,
            createdAt: new Date().toISOString()
          }
        ],
        answers: [],
        notifications: [],
        daily_tracking: [] 
      });
    }
  }

  private loadMock() { 
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}'); 
    } catch {
      throw new Error('SYSTEM_ERR: Failed to parse repository state.');
    }
  }
  
  private saveMock(data: any) { 
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data)); 
  }

  async login(username: string, password?: string, isSignUp: boolean = false): Promise<User> {
    await this.simulateNetwork();
    
    if (this.useSupabase) {
      // 1. Try to find the user
      const { data: user, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .maybeSingle();
      
      if (findError) throw new Error(`DB_ERR: ${findError.message}`);

      if (!user) {
        if (!isSignUp) {
          throw new Error(`AUTH_ERR: Profile "${username}" not found. Please Join first.`);
        }
        // 2. Register new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{ 
            username, 
            password_hash: password || 'password123', 
            role: UserRole.STUDENT,
            credibility_score: 0 
          }])
          .select()
          .single();
        
        if (createError) {
          console.error('Supabase Create Error:', createError);
          throw new Error(`AUTH_ERR: ${createError.message}`);
        }
        
        return {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role as UserRole,
          credibilityScore: newUser.credibility_score || 0,
          doubtsPostedToday: 0,
          dailyLimit: 5
        };
      } else {
        if (isSignUp) {
          throw new Error(`AUTH_ERR: Profile "${username}" already exists. Please Login.`);
        }
        // 3. Verify password
        if (password && user.password_hash !== password) {
          throw new Error(`AUTH_ERR: Incorrect password for "${username}".`);
        }
      }
      
      const today = new Date().toISOString().split('T')[0];
      const { data: track } = await supabase
        .from('daily_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('tracking_date', today)
        .maybeSingle();

      const doubtsPosted = track?.doubts_posted || 0;
      const bonusLimit = track?.bonus_limit || 0;

      return { 
        id: user.id,
        username: user.username,
        role: user.role as UserRole,
        credibilityScore: user.credibility_score || 0,
        doubtsPostedToday: doubtsPosted, 
        dailyLimit: 5 + bonusLimit 
      };
    }

    const db = this.loadMock();
    let user = db.users.find((u: any) => u.username === username);
    
    if (!user) {
      if (!isSignUp) {
        throw new Error(`AUTH_ERR: Profile "${username}" was not found. Please Join first.`);
      }
      // Auto-register in Mock DB
      const newUser = { 
        id: Date.now(), 
        username, 
        password_hash: password || 'password123', 
        role: UserRole.STUDENT, 
        credibilityScore: 0 
      };
      db.users.push(newUser);
      this.saveMock(db);
      user = newUser;
    } else {
      if (isSignUp) {
        throw new Error(`AUTH_ERR: Profile "${username}" already exists. Please Login.`);
      }
      if (password && user.password_hash !== password) {
        throw new Error(`AUTH_ERR: Incorrect password for "${username}".`);
      }
    }
    
    const today = new Date().toISOString().split('T')[0];
    const track = db.daily_tracking.find((t: any) => t.user_id === user.id && t.tracking_date === today) || { doubts_posted: 0, bonus_limit: 0 };
    return { ...user, doubtsPostedToday: track.doubts_posted, dailyLimit: 5 + track.bonus_limit };
  }

  async getDoubts(): Promise<Doubt[]> {
    await this.simulateNetwork();

    if (this.useSupabase) {
      const { data, error } = await supabase
        .from('doubts')
        .select('*, users(username)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(d => ({
        ...d,
        username: d.users?.username || 'Unknown',
        createdAt: d.created_at
      }));
    }

    const db = this.loadMock();
    return db.doubts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getLeaderboard(): Promise<User[]> {
    if (this.useSupabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('role', UserRole.ADMIN)
        .order('credibility_score', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role as UserRole,
        credibilityScore: u.credibility_score,
        dailyLimit: 5,
        doubtsPostedToday: 0
      }));
    }

    const db = this.loadMock();
    return [...db.users]
      .filter(u => u.role !== UserRole.ADMIN)
      .sort((a, b) => b.credibilityScore - a.credibilityScore)
      .slice(0, 5);
  }

  async postDoubt(userId: number, doubtData: any, options: { checkSimilarity: boolean, force: boolean } = { checkSimilarity: true, force: false }) {
    await this.simulateNetwork();
    const today = new Date().toISOString().split('T')[0];

    if (this.useSupabase) {
      // Check limit
      const { data: track } = await supabase
        .from('daily_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('tracking_date', today)
        .single();
      
      const doubtsPosted = track?.doubts_posted || 0;
      const bonusLimit = track?.bonus_limit || 0;
      const maxAllowed = 5 + bonusLimit;

      if (doubtsPosted >= maxAllowed) {
        throw new Error(`LIMIT_ERR: Daily post limit reached.`);
      }

      // Similarity check (simplified for Supabase)
      if (options.checkSimilarity && !options.force) {
        const { data: similar } = await supabase
          .from('doubts')
          .select('*')
          .ilike('title', `%${doubtData.title.split(' ')[0]}%`)
          .limit(3);
        
        if (similar && similar.length > 0) {
          return { similarityFound: true, similarDoubts: similar };
        }
      }

      const { data: newDoubt, error } = await supabase
        .from('doubts')
        .insert([{
          user_id: userId,
          title: doubtData.title,
          content: doubtData.content,
          category: doubtData.category,
          is_anonymous: doubtData.isAnonymous
        }])
        .select()
        .single();
      
      if (error) throw error;

      // Update tracking
      if (track) {
        await supabase
          .from('daily_tracking')
          .update({ doubts_posted: doubtsPosted + 1 })
          .eq('user_id', userId)
          .eq('tracking_date', today);
      } else {
        await supabase
          .from('daily_tracking')
          .insert([{ user_id: userId, tracking_date: today, doubts_posted: 1, bonus_limit: 0 }]);
      }

      return { success: true, doubt: newDoubt };
    }

    const db = this.loadMock();
    let trackIdx = db.daily_tracking.findIndex((t: any) => t.user_id === userId && t.tracking_date === today);
    if (trackIdx === -1) {
        db.daily_tracking.push({ user_id: userId, tracking_date: today, doubts_posted: 0, bonus_limit: 0 });
        trackIdx = db.daily_tracking.length - 1;
    }
    const track = db.daily_tracking[trackIdx];
    const maxAllowed = 5 + track.bonus_limit;

    if (track.doubts_posted >= maxAllowed) {
        throw new Error(`LIMIT_ERR: Daily post limit reached.`);
    }

    const user = db.users.find((u: any) => u.id === userId);
    const newDoubt: Doubt = { 
      id: Date.now(), 
      userId, 
      username: user.username, 
      ...doubtData, 
      createdAt: new Date().toISOString() 
    };
    db.doubts.push(newDoubt);
    db.daily_tracking[trackIdx].doubts_posted += 1;
    this.saveMock(db);
    return { success: true, doubt: newDoubt };
  }

  async postAnswer(userId: number, doubtId: number, steps: any) {
    await this.simulateNetwork();

    if (this.useSupabase) {
      const { data: doubt } = await supabase.from('doubts').select('*').eq('id', doubtId).single();
      if (!doubt) throw new Error('DATA_ERR: Doubt not found.');
      if (userId === doubt.user_id) throw new Error('LOGIC_ERR: Cannot answer own doubt.');

      const { data: newAnswer, error } = await supabase
        .from('answers')
        .insert([{
          doubt_id: doubtId,
          user_id: userId,
          step1: steps.step1,
          step2: steps.step2,
          step3: steps.step3,
          is_verified: false
        }])
        .select()
        .single();
      
      if (error) throw error;

      // Notification
      await supabase.from('notifications').insert([{
        user_id: doubt.user_id,
        message: `Someone answered your doubt.`,
        type: 'NEW_ANSWER',
        is_read: false,
        doubt_id: doubtId
      }]);

      // Bonus limit
      const today = new Date().toISOString().split('T')[0];
      const { data: track } = await supabase.from('daily_tracking').select('*').eq('user_id', userId).eq('tracking_date', today).single();
      if (track) {
        await supabase.from('daily_tracking').update({ bonus_limit: track.bonus_limit + 1 }).eq('user_id', userId).eq('tracking_date', today);
      } else {
        await supabase.from('daily_tracking').insert([{ user_id: userId, tracking_date: today, doubts_posted: 0, bonus_limit: 1 }]);
      }

      return newAnswer;
    }

    const db = this.loadMock();
    const user = db.users.find((u: any) => u.id === userId);
    const doubt = db.doubts.find((d: any) => d.id === doubtId);
    if (!doubt) throw new Error('DATA_ERR: Doubt not found.');
    if (user.id === doubt.userId) throw new Error('LOGIC_ERR: Cannot answer own doubt.');

    const newAnswer: Answer = { id: Date.now(), doubtId, userId, username: user.username, ...steps, isVerified: false, createdAt: new Date().toISOString() };
    db.answers.push(newAnswer);

    const notification: AppNotification = {
      id: Date.now() + 1,
      userId: doubt.userId,
      message: `${user.username} answered your doubt.`,
      type: 'NEW_ANSWER',
      isRead: false,
      createdAt: new Date().toISOString(),
      doubtId: doubtId
    };
    db.notifications = db.notifications || [];
    db.notifications.push(notification);

    const today = new Date().toISOString().split('T')[0];
    let trackIdx = db.daily_tracking.findIndex((t: any) => t.user_id === userId && t.tracking_date === today);
    if (trackIdx === -1) {
        db.daily_tracking.push({ user_id: userId, tracking_date: today, doubts_posted: 0, bonus_limit: 1 });
    } else {
        db.daily_tracking[trackIdx].bonus_limit += 1;
    }
    this.saveMock(db);
    return newAnswer;
  }

  async verifyAnswer(answerId: number, verifierId: number) {
    await this.simulateNetwork();

    if (this.useSupabase) {
      // Check if verifier is a mentor
      const { data: verifier } = await supabase.from('users').select('role').eq('id', verifierId).single();
      if (!verifier || verifier.role !== UserRole.MENTOR) {
        throw new Error('AUTH_ERR: Only mentors can verify answers.');
      }

      const { data: ans, error } = await supabase
        .from('answers')
        .update({ is_verified: true })
        .eq('id', answerId)
        .select()
        .single();
      
      if (error) throw error;

      // Update credibility
      const { data: user } = await supabase.from('users').select('credibility_score').eq('id', ans.user_id).single();
      if (user) {
        await supabase.from('users').update({ credibility_score: (user.credibility_score || 0) + 50 }).eq('id', ans.user_id);
      }

      return ans;
    }

    const db = this.loadMock();
    const verifier = db.users.find((u: any) => u.id === verifierId);
    if (!verifier || verifier.role !== UserRole.MENTOR) {
      throw new Error('AUTH_ERR: Only mentors can verify answers.');
    }

    const ans = db.answers.find((a: any) => a.id === answerId);
    if (!ans) throw new Error('DATA_ERR: Answer not found.');
    ans.isVerified = true;
    const author = db.users.find((u: any) => u.id === ans.userId);
    if (author) {
      author.credibilityScore += 50;
    }
    this.saveMock(db);
    return ans;
  }

  async getAnswers(doubtId: number): Promise<Answer[]> {
    await this.simulateNetwork();

    if (this.useSupabase) {
      const { data, error } = await supabase
        .from('answers')
        .select('*, users(username)')
        .eq('doubt_id', doubtId);
      
      if (error) throw error;
      return data.map(a => ({
        ...a,
        username: a.users?.username || 'Unknown',
        createdAt: a.created_at
      }));
    }

    const db = this.loadMock();
    return db.answers.filter((a: any) => a.doubtId === doubtId);
  }

  async getNotifications(userId: number): Promise<AppNotification[]> {
    if (this.useSupabase) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(n => ({
        ...n,
        userId: n.user_id,
        isRead: n.is_read,
        createdAt: n.created_at,
        doubtId: n.doubt_id
      }));
    }

    const db = this.loadMock();
    return (db.notifications || []).filter((n: any) => n.userId === userId).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markNotificationsRead(userId: number) {
    if (this.useSupabase) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);
      return;
    }

    const db = this.loadMock();
    if (db.notifications) db.notifications = db.notifications.map((n: any) => n.userId === userId ? { ...n, isRead: true } : n);
    this.saveMock(db);
  }
}

export const mockDb = new AcademicDatabaseService();
