
import React, { useState, useEffect } from 'react';
import { Doubt, User, UserRole } from '../types';
import { academicDb } from '../services/dbService';
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
    const data = await academicDb.getDoubts();
    setDoubts(search ? data.filter(d => d.title.toLowerCase().includes(search.toLowerCase())) : data);
  };

  useEffect(() => { fetchDoubts(); }, [search]);

  return (
    <div className="space-y-8 mt-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white transition-colors">Academy Feed</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-medium mt-1">Unlock knowledge through peer collaboration.</p>
        </div>
        <div className="relative w-full sm:w-80 group">
          <input
            type="text"
            placeholder="Search academic topics..."
            className="w-full pl-12 pr-5 py-3.5 glass dark:bg-gray-800/40 border border-gray-200/50 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-primary-500/10 dark:text-white transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="grid gap-8">
        {doubts.map(doubt => (
          <div key={doubt.id} className="glass rounded-[2rem] shadow-xl border border-white/60 dark:border-white/5 overflow-hidden transition-all duration-500">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <span className="px-4 py-1.5 rounded-xl text-[10px] font-black bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 uppercase tracking-widest shadow-sm">{doubt.category}</span>
                <span className="text-[11px] font-bold text-gray-400">{new Date(doubt.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">{doubt.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed line-clamp-2">{doubt.content}</p>
              
              <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-gray-500">
                    {doubt.isAnonymous ? '?' : doubt.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-black text-gray-900 dark:text-white">{doubt.isAnonymous ? 'Anonymous' : doubt.username}</span>
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => setShowWhiteboard(true)} className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl hover:bg-primary-50 transition-all shadow-sm"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                  <button onClick={() => setActiveDoubtId(activeDoubtId === doubt.id ? null : doubt.id)} className="px-6 py-3 bg-primary-600 text-white rounded-2xl text-sm font-black transition-all shadow-lg active:scale-95 shadow-primary-500/20">{activeDoubtId === doubt.id ? 'Close' : 'Insights'}</button>
                </div>
              </div>

              {activeDoubtId === doubt.id && (
                <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-100 dark:border-white/5 animate-in slide-in-from-top-4">
                  <AnswerList doubt={doubt} currentUser={user} onUpdate={fetchDoubts} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {showWhiteboard && <WhiteboardModal onClose={() => setShowWhiteboard(false)} />}
    </div>
  );
};

export default DoubtFeed;
