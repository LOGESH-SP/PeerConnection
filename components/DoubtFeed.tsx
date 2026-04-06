import React, { useState, useEffect } from 'react';
import { Doubt, User, UserRole, Attachment } from '../types';
import { academicDb } from '../services/dbService';
import AnswerList from './AnswerList';
import WhiteboardModal from './WhiteboardModal';
import { Image as ImageIcon, FileText, Music, ExternalLink, Search, MessageCircle, ChevronRight, Bookmark, BookmarkCheck, CheckCircle2, CircleDashed, Filter, Zap, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DoubtFeedProps {
  user: User;
}

const DoubtFeed: React.FC<DoubtFeedProps> = ({ user }) => {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Solved' | 'Unsolved'>('All');
  const [filterTag, setFilterTag] = useState('');
  const [mode, setMode] = useState<'latest' | 'personalized'>('latest');
  const [activeDoubtId, setActiveDoubtId] = useState<number | null>(null);
  const [showWhiteboard, setShowWhiteboard] = useState(false);

  const fetchDoubts = async () => {
    setIsLoading(true);
    let data = await academicDb.getDoubts(filterTag ? [filterTag] : undefined, filterStatus !== 'All' ? filterStatus.toLowerCase() as any : undefined, mode);
    setDoubts(search ? data.filter(d => (d.title || '').toLowerCase().includes(search.toLowerCase()) || (d.content || '').toLowerCase().includes(search.toLowerCase())) : data);
    setIsLoading(false);
  };

  useEffect(() => { fetchDoubts(); }, [search, filterStatus, filterTag, mode]);

  const handleToggleSave = async (doubtId: number) => {
    try {
      const isSaved = await academicDb.saveDoubt(doubtId);
      setDoubts(doubts.map(d => d.id === doubtId ? { ...d, isSaved } : d));
    } catch (error) {
      console.error('Failed to toggle bookmark', error);
    }
  };

  const getAttachmentIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'voice': return <Music className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-12 pb-24 max-w-[1400px] mx-auto">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-8 pb-10 px-8 rounded-[3rem] bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 premium-shadow mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center shadow-lg">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">Explore</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium max-w-md leading-relaxed text-sm">
            Discover peer insights, collaborate on academic challenges, and expand your knowledge base.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full lg:w-auto"
        >
          <div className="flex flex-col gap-4">
             <div className="relative w-full lg:w-96">
               <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                 <Search className="w-4 h-4 text-gray-400" />
               </div>
               <input
                 type="text"
                 placeholder="Search topics, questions..."
                 className="w-full pl-12 pr-6 py-4 glass-card premium-shadow border-none rounded-2xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all outline-none dark:text-white"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
             </div>
             <div className="flex gap-4">
               <select 
                 className="flex-1 px-5 py-4 glass-card premium-shadow border-none rounded-2xl dark:text-white outline-none font-bold text-sm bg-white dark:bg-[#1A1A1D]"
                 value={mode}
                 onChange={(e) => setMode(e.target.value as any)}
               >
                  <option value="latest">Latest Feed</option>
                  <option value="personalized">Smart Routing</option>
               </select>
               <select 
                 className="flex-1 px-5 py-4 glass-card premium-shadow border-none rounded-2xl dark:text-white outline-none font-bold text-sm bg-white dark:bg-[#1A1A1D]"
                 value={filterStatus}
                 onChange={(e) => setFilterStatus(e.target.value as any)}
               >
                  <option value="All">All Status</option>
                  <option value="Solved">Completed</option>
                  <option value="Unsolved">Active</option>
               </select>
             </div>
          </div>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
             Array.from({ length: 3 }).map((_, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card premium-shadow rounded-[2.5rem] p-8 animate-pulse border-none">
                   <div className="w-1/3 h-8 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4"></div>
                   <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2"></div>
                   <div className="w-5/6 h-4 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                </motion.div>
             ))
          ) : doubts.length === 0 ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 glass-card premium-shadow rounded-[3rem] border-none">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">No academic inquiries match your criteria.</p>
             </motion.div>
          ) : (
            doubts.map((doubt, index) => (
            <motion.div 
              key={doubt.id}
              layout
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="glass-card premium-shadow rounded-[2.5rem] overflow-hidden border-none relative group"
            >
              <div className="p-8 md:p-10">
                <div className="absolute top-8 right-8">
                   <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggleSave(doubt.id)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${doubt.isSaved ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                   >
                      {doubt.isSaved ? <BookmarkCheck className="w-5 h-5" fill="currentColor" /> : <Bookmark className="w-5 h-5" />}
                   </motion.button>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-6 pr-16">
                  <span className="px-4 py-1.5 rounded-xl text-[10px] font-black bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                    {doubt.category}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(doubt.tags || []).map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold tracking-wide">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-1.5 ${doubt.status === 'Solved' ? 'bg-[#D7F7E6] text-emerald-800 dark:bg-[#D7F7E6]/10 dark:text-[#D7F7E6]' : 'bg-[#FFEADB] text-orange-800 dark:bg-[#FFEADB]/10 dark:text-[#FFEADB]'}`}>
                    {doubt.status === 'Solved' ? <CheckCircle2 className="w-3 h-3" /> : <CircleDashed className="w-3 h-3" />}
                    <span>{doubt.status || 'Active'}</span>
                  </span>
                  {(doubt as any).routeScore > 0 && mode === 'personalized' && (
                    <span className="px-4 py-1.5 rounded-xl text-[10px] font-black bg-[#E2F2FF] text-blue-800 dark:bg-[#E2F2FF]/10 dark:text-[#E2F2FF] uppercase tracking-widest flex items-center space-x-1">
                      <Zap className="w-3 h-3" />
                      <span>Recommended</span>
                    </span>
                  )}
                </div>

                <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
                  {doubt.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-base leading-relaxed line-clamp-3">
                  {doubt.content}
                </p>
                
                {(doubt.attachments || []).length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-8">
                    {(doubt.attachments || []).map(att => (
                      <a 
                        key={att.id} href={att.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                      >
                        <span className="text-gray-900 dark:text-white">{getAttachmentIcon(att.type)}</span>
                        <span className="truncate max-w-[120px]">{att.name}</span>
                        <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-8 border-t border-gray-100 dark:border-white/5">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center font-black text-xs shadow-sm">
                      {doubt.isAnonymous ? 'A' : doubt.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white block">
                        {doubt.isAnonymous ? 'Anonymous' : doubt.username}
                      </span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {new Date(doubt.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <button 
                      onClick={() => setShowWhiteboard(true)} 
                      className="flex-1 sm:flex-none px-6 py-3.5 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-xs font-black uppercase tracking-widest"
                    >
                      Canvas
                    </button>
                    <button 
                      onClick={() => setActiveDoubtId(activeDoubtId === doubt.id ? null : doubt.id)} 
                      className={`flex-1 sm:flex-none px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${
                        activeDoubtId === doubt.id 
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl' 
                          : 'bg-white dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:border-gray-900 dark:hover:border-white'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{doubt.answers_count || 0} Answers</span>
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {activeDoubtId === doubt.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5">
                        <AnswerList doubt={doubt} currentUser={user} onUpdate={fetchDoubts} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )))}
        </AnimatePresence>
      </div>
      {showWhiteboard && <WhiteboardModal onClose={() => setShowWhiteboard(false)} />}
    </div>
  );
};

export default DoubtFeed;
