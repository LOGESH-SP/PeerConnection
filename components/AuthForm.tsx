import React, { useState } from 'react';
import { User } from '../types';
import { academicDb } from '../services/dbService';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Eye, EyeOff, Mail, ArrowRight, CheckCircle, ShieldCheck, Zap } from 'lucide-react';

interface AuthFormProps {
  onLogin: (user: User) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset' | 'success'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

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
        const user = await academicDb.login(email, password, isSignUp);
        onLogin(user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed.');
      }
    } else if (mode === 'forgot') {
      if (!validateEmail(resetEmail)) {
        setError('Please enter a valid @sonatech.ac.in email address.');
        return;
      }
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
      setMode('success');
    }
  };

  if (mode === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F4F6F8] dark:bg-[#141416]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass-card premium-shadow rounded-[3rem] p-12 text-center relative overflow-hidden"
        >
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Recovered</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-10 leading-relaxed">Your secure credentials are updated. You may now return to your workspace.</p>
          <button
            onClick={() => setMode('login')}
            className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-2 group"
          >
            <span>Access Portal</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-6 relative">
      <div className="w-full max-w-[1000px] flex rounded-[4rem] overflow-hidden glass-card premium-shadow bg-white/80 dark:bg-[#202024]/80 p-6 gap-6">
        
        {/* Left Side Branding */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gray-900 dark:bg-[#1A1A1D] rounded-[3rem] p-12 text-white relative overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-500/20 rounded-full blur-[80px]"></div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-10 border border-white/10">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-5xl font-black mb-6 leading-[1.1] tracking-tight">PeerConnect<br/><span className="text-gray-400 font-light">Academic</span></h1>
            <p className="text-gray-400 text-lg max-w-sm leading-relaxed">Connect, collaborate, and elevate your academic trajectory through collective intelligence.</p>
          </div>
          
          <div className="relative z-10 flex items-center space-x-4">
             <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-xs font-bold`}>
                    U{i}
                  </div>
                ))}
             </div>
             <p className="text-sm text-gray-400 font-medium">+2,000 active scholars</p>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
          <motion.div 
            layout
            className="w-full max-w-sm mx-auto"
          >
            <div className="mb-12">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                {mode === 'login' ? 'Welcome back' : mode === 'forgot' ? 'Reset password' : 'New credential'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                {mode === 'login' && (isSignUp ? 'Enroll in the academic intelligence hub.' : 'Authenticate to sync with your peers.')}
                {mode === 'forgot' && 'Provide your institutional email.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {mode === 'login' && (
                  <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1">Institution Email</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors">
                          <Mail className="w-5 h-5" />
                        </div>
                        <input
                          type="email"
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#1A1A1D] border-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white rounded-2xl outline-none transition-all dark:text-white font-medium shadow-sm"
                          placeholder="identifier@sonatech.ac.in"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center pl-1 pr-1">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Passkey</label>
                        <button type="button" onClick={() => { setMode('forgot'); setError(''); }} className="text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors">Recover</button>
                      </div>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors">
                          <Lock className="w-5 h-5" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-[#1A1A1D] border-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white rounded-2xl outline-none transition-all dark:text-white font-medium shadow-sm"
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {mode === 'forgot' && (
                  <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1">Email</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <Mail className="w-5 h-5" />
                        </div>
                        <input
                          type="email"
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#1A1A1D] rounded-2xl outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white dark:text-white font-medium"
                          placeholder="identifier@sonatech.ac.in"
                          value={resetEmail}
                          onChange={e => setResetEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {mode === 'reset' && (
                  <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1">New Passkey</label>
                      <input
                        type="password"
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-[#1A1A1D] rounded-2xl outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white dark:text-white font-medium"
                        placeholder="Min 8 characters"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1">Confirm Passkey</label>
                      <input
                        type="password"
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-[#1A1A1D] rounded-2xl outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white dark:text-white font-medium"
                        placeholder="Repeat passkey"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl">
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="w-full py-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 mt-4"
              >
                <span>{mode === 'login' ? (isSignUp ? 'Enroll Now' : 'Authorize') : mode === 'forgot' ? 'Send Link' : 'Confirm'}</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            </form>

            {mode === 'login' ? (
              <div className="mt-8 text-center pt-8 border-t border-gray-100 dark:border-white/5">
                <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {isSignUp ? 'Have credentials? Sign in.' : 'New to PeerConnect? Join.'}
                </button>
              </div>
            ) : mode === 'forgot' && (
              <div className="mt-8 text-center pt-8 border-t border-gray-100 dark:border-white/5">
                <button type="button" onClick={() => { setMode('login'); setError(''); }} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Back to login
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
