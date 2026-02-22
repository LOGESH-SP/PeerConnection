
import React, { useState } from 'react';
import { User, Doubt } from '../types';
import { academicDb } from '../services/dbService';

interface PostDoubtProps {
  user: User;
  onSuccess: (msg?: string) => void;
  onUpdateUser: (u: User) => void;
  onError?: (msg: string) => void;
}

const CATEGORIES = [
  "Numerical Methods",
  "Design and Analysis of Algorithms",
  "Software Engineering",
  "Database Management Systems",
  "Embedded System Design",
  "Essence of Indian Traditional Knowledge"
];

const PostDoubt: React.FC<PostDoubtProps> = ({ user, onSuccess, onUpdateUser, onError }) => {
  const [formData, setFormData] = useState({ 
    title: '', 
    content: '', 
    category: CATEGORIES[0], 
    isAnonymous: false,
    checkSimilarity: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [similarDoubts, setSimilarDoubts] = useState<Doubt[]>([]);

  const handleClear = () => {
    setFormData({
      ...formData,
      title: '',
      content: '',
    });
    setError('');
    setSimilarDoubts([]);
  };

  const handleSubmit = async (e: React.FormEvent, force: boolean = false) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    
    setError('');
    setIsSubmitting(true);
    setSimilarDoubts([]);
    
    try {
      const result = await academicDb.postDoubt(user.id, formData, { 
        checkSimilarity: formData.checkSimilarity, 
        force: force 
      });

      if (result.similarityFound) {
        setSimilarDoubts(result.similarDoubts);
        setError('Similarity Check Conflict Detected');
        setIsSubmitting(false);
      } else {
        const updatedUser = await academicDb.login(user.username);
        onUpdateUser(updatedUser);
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 mb-20 animate-in zoom-in-95 duration-500">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="glass dark:bg-gray-800/40 rounded-[3rem] shadow-2xl border border-white/60 dark:border-white/5 p-10 md:p-14">
            <header className="mb-12">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Submit Inquiry</h2>
              <p className="text-gray-500 dark:text-gray-400 font-bold mt-1">Detailed requests get faster, verified answers.</p>
            </header>

            <form onSubmit={(e) => handleSubmit(e)} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Academic Subject</label>
                <select 
                  className="w-full px-5 py-4 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-primary-500/10 dark:text-white outline-none font-bold"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Headline</label>
                <input
                  type="text"
                  placeholder="e.g., Understanding Convergence in Newton Method"
                  className="w-full px-6 py-4 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/5 rounded-2xl dark:text-white font-bold transition-all outline-none focus:bg-white"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Micro-Details</label>
                <textarea
                  placeholder="Explain your specific point of confusion..."
                  rows={5}
                  className="w-full px-6 py-5 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/5 rounded-[2rem] dark:text-white font-medium resize-none shadow-inner outline-none focus:bg-white"
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  required
                ></textarea>
              </div>

              <div className="flex flex-col gap-6 pt-4">
                {/* Similarity Check Toggle - Yellow */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">Enable Similarity Check</span>
                    <span className="text-[10px] text-gray-400 font-bold">Prevent duplicate academic inquiries</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, checkSimilarity: !formData.checkSimilarity})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent ${formData.checkSimilarity ? 'bg-yellow-500 ring-yellow-500/20' : 'bg-gray-300 dark:bg-gray-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.checkSimilarity ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Anonymous Toggle - Blue */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">Post Anonymously</span>
                    <span className="text-[10px] text-gray-400 font-bold">Hide your profile from non-mentors</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, isAnonymous: !formData.isAnonymous})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent ${formData.isAnonymous ? 'bg-blue-600 ring-blue-600/20' : 'bg-gray-300 dark:bg-gray-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isAnonymous ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {similarDoubts.length > 0 && (
                <div className="p-8 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800/40 rounded-[2rem] animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-center space-x-3 mb-6 text-amber-700 dark:text-amber-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span className="text-sm font-black uppercase tracking-wider">Similarity Conflict</span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-200 mb-4 font-bold">The following inquiries might address your confusion. We recommend checking them first to maintain feed quality:</p>
                  <div className="space-y-3 mb-8">
                    {similarDoubts.map(d => (
                      <div key={d.id} className="p-4 bg-white/80 dark:bg-black/40 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-3"></span>
                        {d.title}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      type="button" 
                      onClick={() => setSimilarDoubts([])}
                      className="flex-1 py-3 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-200 transition-colors"
                    >
                      Re-edit Doubt
                    </button>
                    <button 
                      type="button" 
                      onClick={(e) => handleSubmit(e as any, true)}
                      className="flex-1 py-3 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20"
                    >
                      Post Anyway
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-4 pt-10 border-t border-gray-100 dark:border-white/5">
                <button 
                  type="button" 
                  onClick={handleClear}
                  className="px-6 py-3 text-xs font-black uppercase text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  Dismiss
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-12 py-4 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {isSubmitting ? 'Validating...' : 'Publish Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass dark:bg-gray-800/40 p-8 rounded-[2.5rem] border border-white/60 dark:border-white/5 shadow-xl">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">Laboratory Quota</h3>
            <div className="flex justify-between items-end mb-4">
               <span className="text-4xl font-black text-gray-900 dark:text-white">{user.dailyLimit - user.doubtsPostedToday}</span>
               <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Available</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
               <div className="bg-primary-500 h-full rounded-full transition-all duration-1000" style={{ width: `${((user.dailyLimit - user.doubtsPostedToday) / user.dailyLimit) * 100}%` }} />
            </div>
            <p className="mt-6 text-[9px] font-bold text-gray-400 uppercase tracking-tight leading-relaxed">
              Standard lab policy allows 5 posts/day. Verified answers increase your daily quota by +1 per contribution.
            </p>
          </div>
          
          {error && similarDoubts.length === 0 && (
            <div className="p-6 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 text-[10px] font-black uppercase tracking-widest rounded-3xl border-2 border-red-100 dark:border-red-900/30 animate-in shake duration-500">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDoubt;
