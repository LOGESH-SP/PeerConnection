
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { mockDb } from '../services/dbService';

interface AuthFormProps {
  onLogin: (user: User) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('student_alice');
  const [password, setPassword] = useState('123');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await mockDb.login(username);
      onLogin(user);
    } catch (err) {
      setError('The credentials provided do not match any scholar profile.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 animate-in fade-in duration-1000">
      <div className="w-full max-w-lg relative">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="text-center mb-12 relative">
          <div className="inline-flex w-24 h-24 bg-gradient-to-br from-primary-500 to-indigo-700 rounded-[2.5rem] items-center justify-center text-white text-5xl font-black shadow-2xl shadow-primary-500/40 mb-8 rotate-6 hover:rotate-0 transition-transform duration-700">🔗</div>
          <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">PeerConnect</h1>
          <p className="text-xl font-bold text-gray-400 dark:text-gray-500">Accelerating Collective Intelligence</p>
        </div>

        <div className="glass dark:bg-gray-800/40 rounded-[3.5rem] shadow-2xl p-12 md:p-16 border border-white/60 dark:border-white/5 relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-8 relative">
            <div>
              <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-[0.3em] transition-colors">University Alias</label>
              <div className="relative group">
                <div className="absolute left-5 top-5 text-primary-500 group-focus-within:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
                <input
                  type="text"
                  className="w-full pl-14 pr-6 py-5 bg-white/50 dark:bg-gray-900/50 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-900 rounded-[1.5rem] outline-none transition-all dark:text-white font-black text-lg shadow-inner"
                  placeholder="ID or Handle"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-[0.3em] transition-colors">Digital Key</label>
              <div className="relative group">
                <div className="absolute left-5 top-5 text-indigo-500 group-focus-within:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>
                <input
                  type="password"
                  className="w-full pl-14 pr-6 py-5 bg-white/50 dark:bg-gray-900/50 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-900 rounded-[1.5rem] outline-none transition-all dark:text-white font-black text-lg shadow-inner"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            {error && (
              <div className="p-5 bg-red-50/50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-900/40 rounded-3xl animate-in shake duration-500">
                <p className="text-red-600 dark:text-red-400 text-xs font-black text-center uppercase tracking-widest">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-6 bg-gradient-to-r from-primary-600 to-indigo-700 hover:from-primary-700 hover:to-indigo-800 text-white font-black rounded-[1.5rem] shadow-2xl shadow-primary-500/30 transition-all active:scale-95 text-base uppercase tracking-[0.2em]"
            >
              Initialize Session
            </button>
          </form>

          <div className="mt-12 pt-10 border-t border-gray-100 dark:border-white/5 relative">
            <div className="p-6 glass bg-gray-50/50 dark:bg-black/20 rounded-[2rem] border border-gray-100/50 dark:border-white/5">
              <p className="text-center text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.25em] leading-loose transition-colors">
                Available Lab Profiles:<br/>
                <span className="text-primary-600 dark:text-primary-400 font-black">student_alice</span> • <span className="text-indigo-600 dark:text-indigo-400 font-black">mentor_john</span><br/>
                <span className="opacity-50 font-black">Key: 123</span>
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-12 text-gray-400 dark:text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
          Academic Innovation Hub &copy; 2024
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
