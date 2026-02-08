
import React, { useState, useEffect } from 'react';
import { Doubt, User, Answer, UserRole } from '../types';
import { mockDb } from '../services/dbService';
import AnswerList from './AnswerList';
import WhiteboardModal from './WhiteboardModal';

interface DoubtFeedProps {
  user: User;
}

const DoubtFeed: React.FC<DoubtFeedProps> = ({ user }) => {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [search, setSearch] = useState('');
  const [activeDoubtId, setActiveDoubtId] = useState<number | null>(null);
  const [showWhiteboard, setShowWhiteboard] = useState(false);

  const fetchDoubts = async () => {
    const data = await mockDb.getDoubts();
    if (search) {
      setDoubts(data.filter((d: Doubt) => 
        d.title.toLowerCase().includes(search.toLowerCase()) || 
        d.category.toLowerCase().includes(search.toLowerCase())
      ));
    } else {
      setDoubts(data);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, [search]);

  return (
    <div className="space-y-8 mt-12 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white transition-colors duration-200">
            Academy Feed
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-medium mt-1">
            Unlock knowledge through peer collaboration.
          </p>
        </div>
        <div className="relative w-full sm:w-80 group">
          <input
            type="text"
            placeholder="Search academic topics..."
            className="w-full pl-12 pr-5 py-3.5 glass dark:bg-gray-800/40 border border-gray-200/50 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-primary-500/10 dark:text-white transition-all duration-300 outline-none shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="grid gap-8">
        {doubts.length === 0 ? (
          <div className="text-center py-24 glass rounded-3xl border-dashed border-2 border-gray-300 dark:border-gray-700 transition-all duration-300">
            <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <p className="text-xl font-bold text-gray-500 dark:text-gray-400">Silence is rare here. Start a discussion!</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or category filters.</p>
          </div>
        ) : (
          doubts.map(doubt => (
            <div 
              key={doubt.id} 
              className="glass rounded-[2rem] shadow-xl border border-white/60 dark:border-white/5 overflow-hidden group hover:-translate-y-1 transition-all duration-500"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <span className="px-4 py-1.5 rounded-xl text-[10px] font-black bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 uppercase tracking-[0.15em] shadow-sm">
                    {doubt.category}
                  </span>
                  <span className="text-[11px] font-bold text-gray-400 bg-gray-100/50 dark:bg-gray-800/50 px-3 py-1 rounded-lg">
                    {new Date(doubt.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">{doubt.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed text-lg line-clamp-3">{doubt.content}</p>
                
                <div className="flex items-center justify-between pt-6 border-t border-gray-100/80 dark:border-white/5 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-lg font-black text-gray-500 dark:text-gray-300 shadow-inner">
                      {doubt.isAnonymous ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      ) : doubt.username[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="block text-base font-black text-gray-900 dark:text-white">
                        {doubt.isAnonymous ? 'Anonymous' : doubt.username}
                      </span>
                      <span className="block text-[10px] text-primary-500 uppercase font-black tracking-widest">Scholar</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setShowWhiteboard(true)}
                      className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-all active:scale-90 shadow-sm"
                      title="Open Live Board"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button 
                      onClick={() => setActiveDoubtId(activeDoubtId === doubt.id ? null : doubt.id)}
                      className={`px-6 py-3 rounded-2xl text-sm font-black transition-all duration-300 active:scale-95 shadow-lg ${activeDoubtId === doubt.id ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/20'}`}
                    >
                      {activeDoubtId === doubt.id ? 'Close' : 'Insights'}
                    </button>
                  </div>
                </div>

                {activeDoubtId === doubt.id && (
                  <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-100 dark:border-white/5 animate-in slide-in-from-top-4 duration-500">
                    <AnswerList doubt={doubt} currentUser={user} onUpdate={fetchDoubts} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showWhiteboard && <WhiteboardModal onClose={() => setShowWhiteboard(false)} />}
    </div>
  );
};

export default DoubtFeed;
