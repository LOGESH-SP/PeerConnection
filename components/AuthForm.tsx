
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { mockDb } from '../services/dbService';

interface AuthFormProps {
  onLogin: (user: User) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('student_alice@sonatech.ac.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset' | 'success'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validateEmail = (e: string) => e.endsWith('@sonatech.ac.in');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      if (!validateEmail(email)) {
        setError('Please use a valid @sonatech.ac.in email address.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }

      try {
        // Extract username from email for mock login
        const username = email.split('@')[0];
        const user = await mockDb.login(username);
        onLogin(user);
      } catch (err) {
        setError('The credentials provided do not match any scholar profile.');
      }
    } else if (mode === 'forgot') {
      if (!validateEmail(resetEmail)) {
        setError('Please enter a valid @sonatech.ac.in email address.');
        return;
      }
      // Simulate sending verification link
      setMode('reset');
    } else if (mode === 'reset') {
      if (newPassword.length < 8) {
        setError('New password must be at least 8 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      // Simulate password update
      setMode('success');
    }
  };

  if (mode === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 animate-in fade-in duration-1000">
        <div className="w-full max-w-lg glass dark:bg-gray-800/40 rounded-[3.5rem] shadow-2xl p-12 md:p-16 border border-white/60 dark:border-white/5 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-8 shadow-lg shadow-green-500/40">✓</div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Password Updated</h2>
          <p className="text-gray-500 dark:text-gray-400 font-bold mb-10 tracking-tight">Your security credentials have been successfully synchronized.</p>
          <button
            onClick={() => setMode('login')}
            className="w-full py-6 bg-gradient-to-r from-primary-600 to-indigo-700 text-white font-black rounded-[1.5rem] shadow-2xl uppercase tracking-[0.2em]"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

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
            {mode === 'login' && (
              <>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-[0.3em] transition-colors">College Email Address</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-5 text-primary-500 group-focus-within:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
                    <input
                      type="email"
                      className="w-full pl-14 pr-6 py-5 bg-white/50 dark:bg-gray-900/50 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-900 rounded-[1.5rem] outline-none transition-all dark:text-white font-black text-lg shadow-inner"
                      placeholder="example.24cse@sonatech.ac.in"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-[0.3em] transition-colors">Password</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-5 text-indigo-500 group-focus-within:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-14 pr-14 py-5 bg-white/50 dark:bg-gray-900/50 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-900 rounded-[1.5rem] outline-none transition-all dark:text-white font-black text-lg shadow-inner"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-5 text-gray-400 hover:text-primary-500 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                      )}
                    </button>
                  </div>
                  <button 
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); }}
                    className="mt-4 text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              </>
            )}

            {mode === 'forgot' && (
              <div>
                <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-[0.3em] transition-colors">Enter College Email</label>
                <div className="relative group">
                  <div className="absolute left-5 top-5 text-primary-500 group-focus-within:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
                  <input
                    type="email"
                    className="w-full pl-14 pr-6 py-5 bg-white/50 dark:bg-gray-900/50 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-900 rounded-[1.5rem] outline-none transition-all dark:text-white font-black text-lg shadow-inner"
                    placeholder="example.24cse@sonatech.ac.in"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className="mt-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:underline"
                >
                  Back to Login
                </button>
              </div>
            )}

            {mode === 'reset' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-[0.3em] transition-colors">New Password</label>
                  <input
                    type="password"
                    className="w-full px-6 py-5 bg-white/50 dark:bg-gray-900/50 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-900 rounded-[1.5rem] outline-none transition-all dark:text-white font-black text-lg shadow-inner"
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-[0.3em] transition-colors">Confirm Password</label>
                  <input
                    type="password"
                    className="w-full px-6 py-5 bg-white/50 dark:bg-gray-900/50 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-900 rounded-[1.5rem] outline-none transition-all dark:text-white font-black text-lg shadow-inner"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
            
            {error && (
              <div className="p-5 bg-red-50/50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-900/40 rounded-3xl animate-in shake duration-500">
                <p className="text-red-600 dark:text-red-400 text-xs font-black text-center uppercase tracking-widest">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-6 bg-gradient-to-r from-primary-600 to-indigo-700 hover:from-primary-700 hover:to-indigo-800 text-white font-black rounded-[1.5rem] shadow-2xl shadow-primary-500/30 transition-all active:scale-95 text-base uppercase tracking-[0.2em]"
            >
              {mode === 'login' ? 'Initialize Session' : mode === 'forgot' ? 'Send Reset Link' : 'Update Password'}
            </button>
          </form>

          {mode === 'login' && (
            <div className="mt-12 pt-10 border-t border-gray-100 dark:border-white/5 relative">
              <div className="p-6 glass bg-gray-50/50 dark:bg-black/20 rounded-[2rem] border border-gray-100/50 dark:border-white/5">
                <p className="text-center text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.25em] leading-loose transition-colors">
                  Available Lab Profiles:<br/>
                  <span className="text-primary-600 dark:text-primary-400 font-black">student_alice@sonatech.ac.in</span> • <span className="text-indigo-600 dark:text-indigo-400 font-black">mentor_john@sonatech.ac.in</span><br/>
                  <span className="opacity-50 font-black">Key: password123</span>
                </p>
              </div>
            </div>
          )}
        </div>
        
        <p className="text-center mt-12 text-gray-400 dark:text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
          Academic Innovation Hub &copy; 2024
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
