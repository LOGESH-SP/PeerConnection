
import React, { useState, useEffect } from 'react';
import { Doubt, User, UserRole } from '../types';
import { mockDb } from '../services/dbService';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [myDoubts, setMyDoubts] = useState<Doubt[]>([]);
  
  useEffect(() => {
    const fetchMyDoubts = async () => {
      const allDoubts = await mockDb.getDoubts();
      setMyDoubts(allDoubts.filter((d: Doubt) => d.userId === user.id));
    };
    fetchMyDoubts();
  }, [user.id]);
  
  return (
    <div className="space-y-10 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-indigo-700 to-indigo-900 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl border border-white/20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-primary-400/20 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="flex items-center space-x-8">
            <div className="w-24 h-24 glass rounded-[2.5rem] flex items-center justify-center text-4xl font-black border-2 border-white/40 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Scholarly Pulse</h1>
              <div className="flex items-center mt-3 space-x-3">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[11px] font-black uppercase tracking-widest border border-white/30">
                  {user.role}
                </span>
                <span className="text-primary-100 font-bold opacity-80 text-sm">UID_{user.id * 1024}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6">
            <div className="glass bg-white/10 px-10 py-6 rounded-[2rem] border border-white/30 shadow-xl flex flex-col items-center min-w-[160px] hover:scale-105 transition-transform duration-300">
              <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60 mb-2">Credibility</p>
              <p className="text-4xl font-black">{user.credibilityScore}</p>
            </div>
            <div className="glass bg-white/10 px-10 py-6 rounded-[2rem] border border-white/30 shadow-xl flex flex-col items-center min-w-[160px] hover:scale-105 transition-transform duration-300">
              <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60 mb-2">Daily Quota</p>
              <p className="text-4xl font-black">
                {user.doubtsPostedToday}
                <span className="text-xl opacity-40 font-black ml-1">/{user.dailyLimit}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-8">
          <div className="glass dark:bg-gray-800/40 rounded-[2.5rem] p-10 border border-white/60 dark:border-white/5 shadow-xl">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Recent Endeavors</h2>
              <button className="text-xs font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 hover:scale-110 transition-transform">Explore Full History</button>
            </div>
            <div className="space-y-4">
              {myDoubts.length === 0 ? (
                <div className="py-20 text-center glass rounded-3xl border-dashed border-2 border-gray-100 dark:border-gray-800/50">
                  <p className="text-gray-400 dark:text-gray-500 font-bold text-lg">Your academic footprint is currently clean.</p>
                </div>
              ) : (
                myDoubts.slice(0, 5).map(d => (
                  <div key={d.id} className="p-6 glass dark:bg-gray-900/40 rounded-3xl flex justify-between items-center group hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100 dark:hover:border-white/5 cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 rounded-full bg-primary-500 shadow-lg shadow-primary-500/50" />
                      <span className="text-base font-black text-gray-800 dark:text-gray-200 truncate pr-6 transition-colors">{d.title}</span>
                    </div>
                    <span className="text-[11px] font-black text-gray-400 uppercase opacity-60 flex-shrink-0">{new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="glass dark:bg-gray-800/40 rounded-[2.5rem] p-10 border border-white/60 dark:border-white/5 shadow-xl flex flex-col h-full">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-10 tracking-tight">Leveling Matrix</h2>
            <div className="space-y-12 flex-grow">
               <div>
                <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] mb-4">
                  <span className="text-gray-500 dark:text-gray-400">Knowledge Tier</span>
                  <span className="text-primary-600 dark:text-primary-400">Elite Scholar</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-900/60 rounded-full h-4 overflow-hidden shadow-inner border border-white/10 transition-colors">
                  <div className="bg-gradient-to-r from-primary-500 via-indigo-500 to-indigo-700 h-full rounded-full transition-all duration-1000 shadow-lg shadow-primary-500/20" style={{ width: '74%' }}></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-4 font-bold tracking-tight">Next upgrade in 120 Academic Points</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 rounded-[2rem] glass bg-primary-50 dark:bg-primary-900/10 border border-primary-100/50 dark:border-primary-900/20">
                  <p className="text-3xl font-black text-primary-700 dark:text-primary-400">12</p>
                  <p className="text-[9px] font-black text-primary-600/60 uppercase tracking-widest mt-1">Upvotes</p>
                </div>
                <div className="text-center p-6 rounded-[2rem] glass bg-green-50 dark:bg-green-900/10 border border-green-100/50 dark:border-green-800/20 transition-colors">
                  <p className="text-3xl font-black text-green-700 dark:text-green-400 transition-colors">4</p>
                  <p className="text-[9px] font-black text-green-600/60 uppercase tracking-widest mt-1">Verified</p>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-950/40 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 mt-auto transition-colors">
                <div className="flex items-center space-x-3 mb-3">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <span className="text-xs font-black uppercase text-gray-400">System Insight</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium italic">
                  "Contribution is the fastest path to mastery. Verified solutions yield 5x more credibility."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
