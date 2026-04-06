import React, { useState, useEffect } from 'react';
import { User } from './types';
import Sidebar from './components/Sidebar';
import AuthForm from './components/AuthForm';
import DoubtFeed from './components/DoubtFeed';
import Dashboard from './components/Dashboard';
import PostDoubt from './components/PostDoubt';
import ChatSystem from './components/ChatSystem';
import Toast, { ToastType } from './components/Toast';
import { DatabaseStatus } from './components/DatabaseStatus';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'feed' | 'dashboard' | 'post' | 'chat'>('feed');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [notification, setNotification] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('doubt_app_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const notify = (message: string, type: ToastType = 'success') => {
    setNotification({ message, type });
  };

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('doubt_app_user', JSON.stringify(u));
    notify(`Welcome back, Scholar ${u.username}!`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.setItem('doubt_app_user', ''); // clear
    setView('feed');
    notify('Session terminated safely.', 'warning');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#141416] transition-colors selection:bg-primary-500/30">
        <div className="sticky top-0 z-50">
          <DatabaseStatus />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <AuthForm onLogin={handleLogin} />
        </motion.div>
        <AnimatePresence>
          {notification && (
            <Toast 
              message={notification.message} 
              type={notification.type} 
              onClose={() => setNotification(null)} 
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#141416] text-gray-900 dark:text-white transition-colors selection:bg-primary-500/30 flex relative">
      <div className="fixed top-0 left-0 w-full z-50">
        <DatabaseStatus />
      </div>
      
      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 w-full bg-white/80 dark:bg-[#202024]/80 backdrop-blur-md z-40 px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-white/5 mt-8">
        <div className="text-xl font-black">PeerConnect</div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-xl bg-gray-100 dark:bg-white/10">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Desktop (or Mobile if open) */}
      <Sidebar 
        user={user} 
        onLogout={handleLogout} 
        setView={(v) => { setView(v); setMobileMenuOpen(false); }} 
        currentView={view}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isOpen={mobileMenuOpen}
      />
      
      <main className="flex-1 lg:ml-[300px] px-4 sm:px-8 py-24 lg:py-16 max-w-7xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {view === 'feed' && <DoubtFeed user={user} />}
            {view === 'dashboard' && <Dashboard user={user} />}
            {view === 'chat' && <ChatSystem user={user} />}
            {view === 'preferences' && (
              <div className="p-10 glass-card premium-shadow rounded-[3rem] border-none bg-white dark:bg-[#1A1A1D]">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Preferences</h2>
                <p className="text-gray-500">System preferences are under active development.</p>
              </div>
            )}
            {view === 'reports' && (
              <div className="p-10 glass-card premium-shadow rounded-[3rem] border-none bg-white dark:bg-[#1A1A1D]">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Activity Reports</h2>
                <p className="text-gray-500">Analytics dashboard scaling up soon.</p>
              </div>
            )}
            {view === 'post' && (
              <PostDoubt 
                user={user} 
                onSuccess={(msg) => {
                  setView('feed');
                  notify(msg || 'Inquiry published successfully.');
                }}
                onUpdateUser={(updated) => {
                  setUser(updated);
                  localStorage.setItem('doubt_app_user', JSON.stringify(updated));
                }}
                onError={(msg) => notify(msg, 'error')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {notification && (
          <Toast 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
