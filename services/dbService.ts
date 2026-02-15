
import { Doubt, Answer, User, UserRole, AppNotification } from '../types';

/**
 * UNIVERSITY LAB SERVICE LAYER
 * Mimics SQL Database behavior using LocalStorage.
 */
class AcademicDatabaseService {
  private STORAGE_KEY = 'peerconnect_db_v10';

  constructor() {
    this.initialize();
  }

  private async simulateNetwork() {
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400));
  }

  private initialize() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.save({
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

  private load() { 
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}'); 
    } catch {
      throw new Error('SYSTEM_ERR: Failed to parse repository state.');
    }
  }
  
  private save(data: any) { 
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data)); 
  }

  async login(username: string): Promise<User> {
    await this.simulateNetwork();
    const db = this.load();
    const user = db.users.find((u: any) => u.username === username);
    if (!user) throw new Error(`AUTH_ERR: Profile "${username}" was not found.`);
    
    const today = new Date().toISOString().split('T')[0];
    const track = db.daily_tracking.find((t: any) => t.user_id === user.id && t.tracking_date === today) || { doubts_posted: 0, bonus_limit: 0 };
    return { ...user, doubtsPostedToday: track.doubts_posted, dailyLimit: 5 + track.bonus_limit };
  }

  async getDoubts(): Promise<Doubt[]> {
    await this.simulateNetwork();
    const db = this.load();
    return db.doubts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getLeaderboard(): Promise<User[]> {
    const db = this.load();
    return [...db.users]
      .filter(u => u.role !== UserRole.ADMIN)
      .sort((a, b) => b.credibilityScore - a.credibilityScore)
      .slice(0, 5);
  }

  async postDoubt(userId: number, doubtData: any, options: { checkSimilarity: boolean, force: boolean } = { checkSimilarity: true, force: false }) {
    await this.simulateNetwork();
    const db = this.load();
    const today = new Date().toISOString().split('T')[0];
    
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

    if (options.checkSimilarity && !options.force) {
      const stopWords = ['the', 'is', 'at', 'which', 'on', 'how', 'to', 'for', 'of', 'and', 'in', 'can', 'you', 'explain', 'what', 'help'];
      const keywords = doubtData.title.toLowerCase().split(/\W+/)
        .filter((w: string) => w.length > 2 && !stopWords.includes(w));

      const similar = db.doubts.filter((existing: any) => {
        const existingWords = existing.title.toLowerCase().split(/\W+/);
        const matchCount = keywords.filter((k: string) => existingWords.includes(k)).length;
        return matchCount >= 2;
      });

      if (similar.length > 0) {
        return { similarityFound: true, similarDoubts: similar };
      }
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
    this.save(db);
    return { success: true, doubt: newDoubt };
  }

  async postAnswer(userId: number, doubtId: number, steps: any) {
    await this.simulateNetwork();
    const db = this.load();
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
    this.save(db);
    return newAnswer;
  }

  async verifyAnswer(answerId: number) {
    await this.simulateNetwork();
    const db = this.load();
    const ans = db.answers.find((a: any) => a.id === answerId);
    if (!ans) throw new Error('DATA_ERR: Answer not found.');
    ans.isVerified = true;
    const author = db.users.find((u: any) => u.id === ans.userId);
    if (author) {
      author.credibilityScore += 50;
    }
    this.save(db);
    return ans;
  }

  async getAnswers(doubtId: number): Promise<Answer[]> {
    await this.simulateNetwork();
    const db = this.load();
    return db.answers.filter((a: any) => a.doubtId === doubtId);
  }

  async getNotifications(userId: number): Promise<AppNotification[]> {
    const db = this.load();
    return (db.notifications || []).filter((n: any) => n.userId === userId).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markNotificationsRead(userId: number) {
    const db = this.load();
    if (db.notifications) db.notifications = db.notifications.map((n: any) => n.userId === userId ? { ...n, isRead: true } : n);
    this.save(db);
  }
}

export const mockDb = new AcademicDatabaseService();
