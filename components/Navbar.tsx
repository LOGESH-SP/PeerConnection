
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, AppNotification } from '../types';
import { academicDb } from '../services/dbService';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  setView: (view: 'feed' | 'dashboard' | 'post') => void;
  currentView: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, setView, currentView, isDarkMode, toggleDarkMode }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    const data = await academicDb.getNotifications(user.id);
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Poll every 5s for lab demo simplicity
    return () => clearInterval(interval);
  }, [user.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleNotifications = async () => {
    if (!showNotifications) {
      await academicDb.markNotificationsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
    setShowNotifications(!showNotifications);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="sticky top-4 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-50">
      <div className="glass rounded-2xl shadow-lg border border-white/40 dark:border-white/10 px-4 sm:px-6 h-16 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center space-x-8">
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer group space-x-3" 
            onClick={() => setView('feed')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">🔗</div>
            <span className="hidden sm:block text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">PeerConnect</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            <button 
              onClick={() => setView('feed')}
              className={`px-4 py-2 rounded-xl text-sm font-bold tracking-tight transition-all duration-300 ${currentView === 'feed' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-600 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-700/50'}`}
            >
              Feed
            </button>
            <button 
              onClick={() => setView('dashboard')}
              className={`px-4 py-2 rounded-xl text-sm font-bold tracking-tight transition-all duration-300 ${currentView === 'dashboard' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-600 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-700/50'}`}
            >
              Dashboard
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 md:space-x-5">
          {/* Notifications Center */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleToggleNotifications}
              className={`p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:scale-110 transition-all active:scale-95 shadow-inner relative ${showNotifications ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : ''}`}
              aria-label="View Notifications"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900 animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-4 w-80 glass dark:bg-gray-900/90 rounded-3xl shadow-2xl border border-white/40 dark:border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Scholar Alerts</h3>
                  {unreadCount > 0 && <span className="text-[10px] font-black text-primary-500 uppercase">{unreadCount} New</span>}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center">
                      <p className="text-gray-400 dark:text-gray-500 text-xs font-bold italic">No alerts yet. Stay active!</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`p-5 border-b border-gray-50 dark:border-white/5 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!n.isRead ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
                        onClick={() => {
                          if (n.doubtId) setView('feed');
                          setShowNotifications(false);
                        }}
                      >
                        <div className="flex space-x-3">
                          <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'VERIFIED' ? 'bg-green-500' : 'bg-primary-500'}`} />
                          <div>
                            <p className="text-xs text-gray-800 dark:text-gray-200 font-medium leading-relaxed">{n.message}</p>
                            <span className="text-[9px] text-gray-400 font-black uppercase mt-2 block tracking-widest">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 text-center">
                   <button onClick={() => setShowNotifications(false)} className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-primary-500">Close Center</button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:scale-110 transition-all active:scale-95 shadow-inner"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.071 16.071l.707.707M7.636 7.636l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>

          {user.role === UserRole.STUDENT && (
             <button 
              onClick={() => setView('post')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-300 shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              <span>Ask</span>
            </button>
          )}

          <div className="hidden sm:flex flex-col items-end pr-4 border-r border-gray-200 dark:border-gray-700 h-8 justify-center">
            <span className="text-sm font-black text-gray-800 dark:text-white leading-none mb-1">{user.username}</span>
            <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest leading-none">{user.role}</span>
          </div>
          
          <button 
            onClick={onLogout}
            className="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 transition-all p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-90"
            title="Logout"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
