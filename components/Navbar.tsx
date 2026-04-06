
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, AppNotification } from '../types';
import { academicDb } from '../services/dbService';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Moon, Sun, Plus, LogOut, LayoutDashboard, MessageSquare, Rss } from 'lucide-react';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  setView: (view: 'feed' | 'dashboard' | 'post' | 'chat') => void;
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
    const interval = setInterval(fetchNotifications, 5000);
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
    <nav className="sticky top-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-50">
      <div className="glass-card rounded-3xl px-6 h-20 flex items-center justify-between transition-all duration-500">
        <div className="flex items-center space-x-10">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-shrink-0 flex items-center cursor-pointer group space-x-3" 
            onClick={() => setView('feed')}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-all duration-300">
              <Rss className="w-6 h-6" />
            </div>
            <span className="hidden sm:block text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              PeerConnect
            </span>
          </motion.div>
          
          <div className="hidden md:flex items-center space-x-2">
            {[
              { id: 'feed', label: 'Feed', icon: Rss },
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'chat', label: 'Chat', icon: MessageSquare },
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={`relative px-5 py-2.5 rounded-2xl text-sm font-bold tracking-tight transition-all duration-300 flex items-center space-x-2 ${
                  currentView === item.id 
                    ? 'text-white' 
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                }`}
              >
                {currentView === item.id && (
                  <motion.div 
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-primary-500 rounded-2xl shadow-lg shadow-primary-500/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={`w-4 h-4 relative z-10 ${currentView === item.id ? 'text-white' : ''}`} />
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative" ref={dropdownRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleNotifications}
              className={`p-3 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 transition-all relative ${showNotifications ? 'ring-2 ring-primary-500/50 bg-primary-50 dark:bg-primary-900/20 text-primary-600' : ''}`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-gray-950">
                  {unreadCount}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-80 glass-card rounded-[2rem] overflow-hidden z-50"
                >
                  <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Scholar Alerts</h3>
                    {unreadCount > 0 && <span className="px-2 py-0.5 bg-primary-500 text-white text-[9px] font-black rounded-full uppercase">{unreadCount} New</span>}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center">
                        <p className="text-gray-400 text-xs font-bold italic">No alerts yet.</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-6 border-b border-gray-50 dark:border-white/5 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!n.isRead ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
                          onClick={() => {
                            if (n.doubtId) setView('feed');
                            setShowNotifications(false);
                          }}
                        >
                          <div className="flex space-x-4">
                            <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'VERIFIED' ? 'bg-green-500' : 'bg-primary-500'}`} />
                            <div>
                              <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">{n.message}</p>
                              <span className="text-[10px] text-gray-400 font-bold uppercase mt-3 block tracking-widest">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 text-center">
                     <button onClick={() => setShowNotifications(false)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary-500 transition-colors">Close Center</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="p-3 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 transition-all"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>

          {user.role === UserRole.STUDENT && (
             <motion.button 
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView('post')}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-2xl text-sm font-black transition-all shadow-xl shadow-black/10 dark:shadow-white/5 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
              <span>Ask Doubt</span>
            </motion.button>
          )}

          <div className="hidden sm:flex items-center space-x-4 pl-4 border-l border-gray-200 dark:border-gray-800">
            <div className="text-right">
              <div className="text-sm font-black text-gray-900 dark:text-white leading-none mb-1">{user.username}</div>
              <div className="text-[10px] font-black text-primary-500 uppercase tracking-widest leading-none">{user.role}</div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={onLogout}
              className="text-gray-400 hover:text-red-500 transition-colors p-2"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

