
import { Doubt, Answer, User, UserRole, AppNotification } from '../types';
import { supabase } from './supabaseClient';

/**
 * UNIVERSITY LAB SERVICE LAYER
 * Integrates with Supabase for real-time persistence.
 */
class AcademicDatabaseService {
  private async simulateNetwork() {
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400));
  }

  async login(username: string, password?: string, isSignUp: boolean = false): Promise<User> {
    await this.simulateNetwork();
    
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

  async getDoubts(): Promise<Doubt[]> {
    await this.simulateNetwork();

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

  async getLeaderboard(): Promise<User[]> {
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

  async postDoubt(userId: number, doubtData: any, options: { checkSimilarity: boolean, force: boolean } = { checkSimilarity: true, force: false }) {
    await this.simulateNetwork();
    const today = new Date().toISOString().split('T')[0];

    // Check limit
    const { data: track } = await supabase
      .from('daily_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('tracking_date', today)
      .maybeSingle();
    
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

  async postAnswer(userId: number, doubtId: number, steps: any) {
    await this.simulateNetwork();

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
    const { data: track } = await supabase.from('daily_tracking').select('*').eq('user_id', userId).eq('tracking_date', today).maybeSingle();
    if (track) {
      await supabase.from('daily_tracking').update({ bonus_limit: track.bonus_limit + 1 }).eq('user_id', userId).eq('tracking_date', today);
    } else {
      await supabase.from('daily_tracking').insert([{ user_id: userId, tracking_date: today, doubts_posted: 0, bonus_limit: 1 }]);
    }

    return newAnswer;
  }

  async verifyAnswer(answerId: number, verifierId: number) {
    await this.simulateNetwork();

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

  async getAnswers(doubtId: number): Promise<Answer[]> {
    await this.simulateNetwork();

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

  async getNotifications(userId: number): Promise<AppNotification[]> {
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

  async markNotificationsRead(userId: number) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
  }
}

export const academicDb = new AcademicDatabaseService();
