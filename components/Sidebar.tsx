import React from 'react';
import { User, UserRole } from '../types';
import { motion } from 'motion/react';
import { LogOut, LayoutDashboard, MessageSquare, Rss, Settings, Info, Zap, ChevronRight, BookOpen, Sun, Moon, Plus } from 'lucide-react';

interface SidebarProps {
  user: User;
  onLogout: () => void;
  setView: (view: 'feed' | 'dashboard' | 'post' | 'chat') => void;
  currentView: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, setView, currentView, isDarkMode, toggleDarkMode, isOpen }) => {
  const navItems = [
    { id: 'feed', label: 'Explore', icon: Rss },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Discussions', icon: MessageSquare },
  ];

  const bottomItems = [
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'reports', label: 'Reports', icon: Info },
  ];

  return (
    <div className={`fixed top-0 left-0 h-full bg-white/80 dark:bg-[#1A1A1D]/80 backdrop-blur-3xl border-r border-gray-100 dark:border-white/5 transition-transform duration-500 z-40 w-[280px] p-6 flex flex-col pt-16 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      
      <div className="flex items-center space-x-4 mb-16">
        <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
           <Zap className="text-white dark:text-gray-900 w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight leading-none text-gray-900 dark:text-white">PeerConnect</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Learning</p>
        </div>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2">
        <div>
           <p className="text-xs font-black text-gray-400 uppercase tracking-widest pl-4 mb-4">Menu</p>
           <ul className="space-y-2">
             {navItems.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => setView(item.id as any)}
                    className={`w-full flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all group ${currentView === item.id ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 premium-shadow' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'}`}
                  >
                     <item.icon className={`w-5 h-5 ${currentView === item.id ? '' : 'group-hover:text-gray-900 dark:group-hover:text-white'}`} />
                     <span className="font-bold text-sm tracking-wide">{item.label}</span>
                     {currentView === item.id && (
                       <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                     )}
                  </button>
                </li>
             ))}
             {user.role === UserRole.STUDENT && (
                <li>
                  <button
                    onClick={() => setView('post')}
                    className={`w-full flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all group ${currentView === 'post' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 premium-shadow' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'}`}
                  >
                     <Plus className={`w-5 h-5 ${currentView === 'post' ? '' : 'group-hover:text-gray-900 dark:group-hover:text-white'}`} />
                     <span className="font-bold text-sm tracking-wide">Ask Doubt</span>
                  </button>
                </li>
             )}
           </ul>
        </div>

        <div>
           <p className="text-xs font-black text-gray-400 uppercase tracking-widest pl-4 mb-4">System</p>
           <ul className="space-y-2">
              <li>
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 group pt-1"
                >
                   <div className="flex items-center space-x-4">
                     {isDarkMode ? <Moon className="w-5 h-5 group-hover:text-gray-900 dark:group-hover:text-white" /> : <Sun className="w-5 h-5 group-hover:text-gray-900 dark:group-hover:text-white" />}
                     <span className="font-bold text-sm tracking-wide group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Theme</span>
                   </div>
                   <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative transition-colors shadow-inner">
                      <motion.div 
                        animate={{ x: isDarkMode ? 16 : 2 }}
                        className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm"
                      />
                   </div>
                </button>
              </li>
             {bottomItems.map(item => (
                <li key={item.id}>
                  <button onClick={() => setView(item.id as any)} className={`w-full flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all group ${currentView === item.id ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 premium-shadow' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'}`}>
                     <item.icon className={`w-5 h-5 ${currentView === item.id ? '' : 'group-hover:text-gray-900 dark:group-hover:text-white'}`} />
                     <span className={`font-bold text-sm tracking-wide ${currentView === item.id ? '' : 'group-hover:text-gray-900 dark:group-hover:text-white'}`}>{item.label}</span>
                  </button>
                </li>
             ))}
           </ul>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-gray-100 dark:border-white/5">
        <div className="bg-gray-50 dark:bg-white/5 rounded-[2rem] p-4 flex items-center justify-between">
           <div className="flex items-center space-x-3 overflow-hidden pr-2">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E2F2FF] to-[#D7F7E6] text-gray-900 flex items-center justify-center font-black text-xs shrink-0 shadow-sm border border-white/40">
               {user.username.substring(0, 2).toUpperCase()}
             </div>
             <div className="truncate">
               <p className="font-bold text-sm text-gray-900 dark:text-white truncate pb-0.5">{user.username}</p>
               <p className="font-black text-[9px] text-[#A3A3A3] uppercase tracking-widest leading-none">{user.role}</p>
             </div>
           </div>
           
           <button 
             onClick={onLogout}
             className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center shrink-0 shadow-sm premium-shadow"
           >
             <LogOut className="w-4 h-4 ml-0.5" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
