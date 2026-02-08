
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import Navbar from './components/Navbar';
import AuthForm from './components/AuthForm';
import DoubtFeed from './components/DoubtFeed';
import Dashboard from './components/Dashboard';
import PostDoubt from './components/PostDoubt';
import Toast, { ToastType } from './components/Toast';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'feed' | 'dashboard' | 'post'>('feed');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
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
    localStorage.removeItem('doubt_app_user');
    setView('feed');
    notify('Session terminated safely.', 'warning');
  };

  if (!user) {
    return (
      <>
        <AuthForm onLogin={handleLogin} />
        {notification && (
          <Toast 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        setView={setView} 
        currentView={view}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'feed' && <DoubtFeed user={user} />}
        {view === 'dashboard' && <Dashboard user={user} />}
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
      </main>

      {notification && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
    </div>
  );
};

export default App;
