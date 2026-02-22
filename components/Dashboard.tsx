
import React, { useState, useEffect } from 'react';
import { Doubt, User, UserRole } from '../types';
import { academicDb } from '../services/dbService';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [myDoubts, setMyDoubts] = useState<Doubt[]>([]);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const allDoubts = await academicDb.getDoubts();
      setMyDoubts(allDoubts.filter(d => d.userId === user.id));
      const topUsers = await academicDb.getLeaderboard();
      setLeaderboard(topUsers);
    };
    fetchData();
  }, [user.id]);
  
  return (
    <div className="space-y-10 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-indigo-700 to-indigo-900 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl border border-white/20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="flex items-center space-x-8">
            <div className="w-24 h-24 glass rounded-[2.5rem] flex items-center justify-center text-4xl font-black border-2 border-white/40 shadow-2xl rotate-3 transition-transform duration-500 text-gray-900 dark:text-white">
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Scholarly Pulse</h1>
              <div className="flex items-center mt-3 space-x-3">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[11px] font-black uppercase tracking-widest border border-white/30">{user.role}</span>
                <span className="text-primary-100 font-bold opacity-80 text-sm">UID_{user.id * 1024}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="glass bg-white/10 px-10 py-6 rounded-[2rem] border border-white/30 shadow-xl flex flex-col items-center min-w-[160px]">
              <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60 mb-2">Credibility</p>
              <p className="text-4xl font-black">{user.credibilityScore}</p>
            </div>
            <div className="glass bg-white/10 px-10 py-6 rounded-[2rem] border border-white/30 shadow-xl flex flex-col items-center min-w-[160px]">
              <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60 mb-2">Daily Quota</p>
              <p className="text-4xl font-black">{user.doubtsPostedToday}<span className="text-xl opacity-40 font-black ml-1">/{user.dailyLimit}</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-8">
          <div className="glass dark:bg-gray-800/40 rounded-[2.5rem] p-10 border border-white/60 dark:border-white/5 shadow-xl h-full">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Doubt Repository</h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-4 py-1.5 rounded-full">{myDoubts.length} Total</span>
            </div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {myDoubts.length === 0 ? (
                <div className="py-20 text-center glass rounded-3xl border-dashed border-2 border-gray-100 dark:border-gray-800/50">
                  <p className="text-gray-400 dark:text-gray-500 font-bold text-lg">Your academic footprint is currently clean.</p>
                </div>
              ) : (
                myDoubts.map(d => (
                  <div key={d.id} className="p-6 glass dark:bg-gray-900/40 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-100">
                    <div className="flex items-start md:items-center space-x-4">
                      <div className="w-3 h-3 rounded-full bg-primary-500 shadow-lg shadow-primary-500/50" />
                      <div>
                        <span className="text-base font-black text-gray-800 dark:text-gray-200 line-clamp-1">{d.title}</span>
                        <div className="flex items-center mt-1 space-x-3 text-[9px] font-black uppercase tracking-widest text-gray-400">
                          <span>{d.category}</span>
                          <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass dark:bg-gray-800/40 rounded-[2.5rem] p-10 border border-white/60 dark:border-white/5 shadow-xl h-full">
            <div className="flex items-center space-x-3 mb-10">
              <div className="w-2 h-8 bg-yellow-500 rounded-full" />
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Wall of Fame</h2>
            </div>
            <div className="space-y-6">
              {leaderboard.map((u, idx) => (
                <div 
                  key={u.id} 
                  className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${u.id === user.id ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800' : 'bg-white/50 dark:bg-gray-900/50 border-gray-100 dark:border-white/5'}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-600' : idx === 1 ? 'bg-gray-100 text-gray-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                      {idx + 1}
                    </div>
                    <div>
                      <span className="block text-sm font-black text-gray-800 dark:text-gray-200">{u.username}</span>
                      <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">{u.role}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-black text-primary-600 dark:text-primary-400">{u.credibilityScore}</span>
                    <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Points</span>
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <p className="text-center text-gray-500 font-bold italic py-10">Ranking data initializing...</p>
              )}
            </div>
            <div className="mt-10 p-6 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-3xl border border-yellow-100 dark:border-yellow-900/30">
               <p className="text-[10px] font-bold text-yellow-800 dark:text-yellow-200 uppercase tracking-tight leading-relaxed">
                 Top scholars earn extra daily post quotas and exclusive "Verified Mentor" status. Help others to climb the ranks!
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
