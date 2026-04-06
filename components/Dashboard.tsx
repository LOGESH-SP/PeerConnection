import React, { useState, useEffect } from 'react';
import { Doubt, User, UserRole } from '../types';
import { academicDb } from '../services/dbService';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Zap, History, Trophy, TrendingUp, Star, Shield, BookOpen, ChevronRight, Activity, ArrowUpRight } from 'lucide-react';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [myDoubts, setMyDoubts] = useState<Doubt[]>([]);
  const [savedDoubts, setSavedDoubts] = useState<Doubt[]>([]);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  
  useEffect(() => {
    const fetchData = async () => {
      const allDoubts = await academicDb.getDoubts();
      setMyDoubts(allDoubts.filter(d => d.userId === user.id));
      const saved = await academicDb.getSavedDoubts();
      setSavedDoubts(saved);
      const topUsers = await academicDb.getLeaderboard();
      setLeaderboard(topUsers);
    };
    fetchData();
  }, [user.id]);
  
  return (
    <div className="space-y-8 pb-24 max-w-[1400px] mx-auto">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         <motion.div 
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
           className="glass-card premium-shadow rounded-[2.5rem] p-8 flex flex-col justify-between h-48 border-none bg-[#FFEADB] dark:bg-[#FFEADB]/90 text-orange-900 relative overflow-hidden"
         >
           <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
           <div>
              <p className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-2">My Posts</p>
              <h3 className="text-5xl font-black">{myDoubts.length}</h3>
           </div>
           <div className="flex items-center justify-between mt-auto">
             <span className="text-sm font-bold opacity-80">Total recorded</span>
             <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
             </div>
           </div>
         </motion.div>

         <motion.div 
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
           className="glass-card premium-shadow rounded-[2.5rem] p-8 flex flex-col justify-between h-48 border-none bg-[#D7F7E6] dark:bg-[#D7F7E6]/90 text-emerald-900 relative overflow-hidden"
         >
           <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
           <div>
              <p className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-2">Accuracy</p>
              <h3 className="text-5xl font-black">{(user as any).accuracy || 0}<span className="text-2xl ml-1">%</span></h3>
           </div>
           <div className="flex items-center justify-between mt-auto">
             <span className="text-sm font-bold opacity-80">Response success</span>
             <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
             </div>
           </div>
         </motion.div>

         <motion.div 
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
           className="glass-card premium-shadow rounded-[2.5rem] p-8 flex flex-col justify-between h-48 border-none bg-[#FDE2DF] dark:bg-[#FDE2DF]/90 text-rose-900 relative overflow-hidden"
         >
           <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
           <div>
              <p className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-2">Bookmarked</p>
              <h3 className="text-5xl font-black">{savedDoubts.length}</h3>
           </div>
           <div className="flex items-center justify-between mt-auto">
             <span className="text-sm font-bold opacity-80">Saved for later</span>
             <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                <Star className="w-5 h-5" />
             </div>
           </div>
         </motion.div>

         <div className="glass-card premium-shadow rounded-[2.5rem] p-8 flex flex-col justify-between h-48 border-none bg-[#E2F2FF] dark:bg-[#E2F2FF]/90 text-blue-900 relative overflow-hidden">
           <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
           <div>
              <p className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-2">Answers</p>
              <h3 className="text-5xl font-black">{(user as any).totalAnswers || 0}</h3>
           </div>
           <div className="flex items-center justify-between mt-auto">
             <span className="text-sm font-bold opacity-80">Helped peers</span>
             <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                <Award className="w-5 h-5" />
             </div>
           </div>
         </div>

         <div className="glass-card premium-shadow rounded-[2.5rem] p-8 flex flex-col justify-between h-48 border-none bg-indigo-50 dark:bg-indigo-900/40 text-indigo-900 dark:text-indigo-200 relative overflow-hidden">
           <div>
              <p className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-2">Post Quota</p>
              <h3 className="text-5xl font-black">{(user.dailyLimit || 5) - (user.doubtsPostedToday || 0)}</h3>
           </div>
           <div className="flex items-center justify-between mt-auto">
             <span className="text-sm font-bold opacity-80">Doubts Available</span>
             <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-800/50 flex items-center justify-center">
                <Zap className="w-5 h-5" />
             </div>
           </div>
         </div>

         <div className="glass-card premium-shadow rounded-[2.5rem] p-8 flex flex-col justify-between h-48 border-none bg-purple-50 dark:bg-purple-900/40 text-purple-900 dark:text-purple-200 relative overflow-hidden">
           <div>
              <p className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-2">Current Streak</p>
              <h3 className="text-5xl font-black">{Math.floor(Math.random() * 10) + 1} <span className="text-2xl">Days</span></h3>
           </div>
           <div className="flex items-center justify-between mt-auto">
             <span className="text-sm font-bold opacity-80">Consistent Learner</span>
             <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-800/50 flex items-center justify-center">
                <Activity className="w-5 h-5" />
             </div>
           </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        
        {/* Main Section */}
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-8">
           
           {/* Detailed Activity and Reputation */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
             className="glass-card premium-shadow rounded-[3rem] p-10 dark:bg-[#1A1A1D] border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center gap-10"
           >
              <div className="w-32 h-32 rounded-full border-8 border-gray-50 dark:border-[#202024] bg-gradient-to-br from-[#1A1A1D] to-[#3A3A40] dark:from-white dark:to-gray-200 flex items-center justify-center shadow-2xl relative">
                 <span className="text-5xl font-black text-white dark:text-[#1A1A1D]">{user.username.charAt(0)}</span>
                 {(user as any).isTopContributor && (
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full border-4 border-white dark:border-[#1A1A1D] flex items-center justify-center text-white">
                      <Star className="w-4 h-4" />
                    </div>
                 )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                 <div className="inline-flex items-center space-x-2 bg-gray-100 dark:bg-white/5 rounded-full px-4 py-1.5 mb-4">
                   <Shield className="w-3.5 h-3.5 text-gray-400" />
                   <span className="text-xs font-black uppercase tracking-widest text-gray-500">{user.role}</span>
                 </div>
                 <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{user.username}</h2>
                 <p className="text-gray-400 font-medium text-sm">Institution verified scholar • UID: {user.id * 8000}</p>
              </div>

              <div className="bg-gray-50 dark:bg-white/5 rounded-[2rem] p-6 min-w-[200px] text-center">
                 <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Reputation</div>
                 <div className="text-4xl font-black text-gray-900 dark:text-white">{user.credibilityScore}</div>
                 <div className="mt-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gray-900 dark:bg-white h-full rounded-full" style={{ width: '70%' }}></div>
                 </div>
              </div>
           </motion.div>

           {/* Doubts Feed */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
             className="glass-card premium-shadow rounded-[3rem] p-10 dark:bg-[#1A1A1D] border-gray-100 dark:border-white/5 flex-1"
           >
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center space-x-6">
                    <button 
                       onClick={() => setActiveTab('posts')}
                       className={`text-xl font-black transition-colors ${activeTab === 'posts' ? 'text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                       Your Repository
                    </button>
                    <button 
                       onClick={() => setActiveTab('saved')}
                       className={`text-xl font-black transition-colors ${activeTab === 'saved' ? 'text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                       Saved Doubts
                    </button>
                 </div>
                 <button className="text-sm font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center space-x-1">
                    <span>View All</span>
                    <ArrowUpRight className="w-4 h-4" />
                 </button>
              </div>

              <div className="space-y-3">
                 {(activeTab === 'posts' ? myDoubts : savedDoubts).slice(0,5).map((d) => (
                    <div key={d.id} className="group p-5 rounded-[1.5rem] bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex items-center justify-between cursor-pointer">
                      <div className="flex items-center space-x-4">
                         <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1A1A1D] shadow-sm flex items-center justify-center">
                           {activeTab === 'posts' ? <Activity className="w-4 h-4 text-gray-400" /> : <Star className="w-4 h-4 text-gray-400" />}
                         </div>
                         <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-gray-100 line-clamp-1">{d.title}</p>
                            <p className="text-xs font-medium text-gray-400 mt-0.5">{d.category}</p>
                         </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                    </div>
                 ))}
                 {(activeTab === 'posts' ? myDoubts : savedDoubts).length === 0 && (
                    <div className="py-12 text-center bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-dashed border-gray-200 dark:border-white/10">
                       {activeTab === 'posts' ? <History className="w-8 h-8 text-gray-300 mx-auto mb-3" /> : <Star className="w-8 h-8 text-gray-300 mx-auto mb-3" />}
                       <p className="text-sm font-bold text-gray-400">No {activeTab === 'posts' ? 'activity recorded' : 'saved doubts'} yet.</p>
                    </div>
                 )}
              </div>
           </motion.div>
        </div>

        {/* Right Sidebar - Leaderboard */}
        <motion.div 
           initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
           className="lg:col-span-1 glass-card premium-shadow rounded-[3rem] p-8 dark:bg-[#1f1f22] bg-[#1A1A1D] text-white flex flex-col"
        >
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black">Top Scholars</h3>
              <Trophy className="w-5 h-5 text-yellow-400" />
           </div>

           <div className="space-y-4 flex-1">
             {leaderboard.map((u, idx) => (
                <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${idx === 0 ? 'bg-yellow-400 text-yellow-900' : idx === 1 ? 'bg-gray-300 text-gray-900' : idx === 2 ? 'bg-orange-400 text-orange-900' : 'bg-white/10 text-white'}`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{u.username}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">{u.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-white">{u.credibilityScore}</p>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">PTS</p>
                  </div>
                </div>
             ))}
           </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Dashboard;
