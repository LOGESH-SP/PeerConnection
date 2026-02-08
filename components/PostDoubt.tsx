
import React, { useState } from 'react';
import { User, Doubt } from '../types';
import { mockDb } from '../services/dbService';

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
    enableSimilarityCheck: true
  });
  const [similarDoubts, setSimilarDoubts] = useState<Doubt[]>([]);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanPerformed, setScanPerformed] = useState(false);

  const handleAPIError = (err: any) => {
    const msg = err.message || 'A network error occurred while communicating with the repository.';
    setError(msg);
    if (onError) onError(msg);
  };

  const runSimilarityCheck = async () => {
    if (!formData.title.trim()) {
      setError('A title is mandatory for similarity scanning.');
      return;
    }
    setIsScanning(true);
    setError('');
    
    try {
      const result = await mockDb.postDoubt(user.id, { ...formData, checkOnly: true });
      if (result.similarityFound) {
        setSimilarDoubts(result.similar);
        setError(`${result.similar.length} related inquiries detected. Please review.`);
      } else {
        setSimilarDoubts([]);
        setError('Similarity Check Passed: This inquiry is unique.');
      }
      setScanPerformed(true);
    } catch (err: any) {
      handleAPIError(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and Content fields are required.');
      return;
    }

    setError('');
    setIsScanning(true);
    
    try {
      const result = await mockDb.postDoubt(user.id, { 
        ...formData, 
        force: !formData.enableSimilarityCheck 
      });

      if (result.similarityFound && formData.enableSimilarityCheck) {
        setSimilarDoubts(result.similar);
        setError('Similarity Conflict: Review existing topics or Force Publish.');
        setIsScanning(false);
      } else {
        const updatedUser = await mockDb.login(user.username);
        onUpdateUser(updatedUser);
        onSuccess('Your inquiry has been broadcasted to the community.');
      }
    } catch (err: any) {
      handleAPIError(err);
      setIsScanning(false);
    }
  };

  const handleForcePost = async () => {
    try {
        setError('');
        setIsScanning(true);
        await mockDb.postDoubt(user.id, { ...formData, force: true });
        const updatedUser = await mockDb.login(user.username);
        onUpdateUser(updatedUser);
        onSuccess('Inquiry force-published successfully.');
    } catch (err: any) {
        handleAPIError(err);
    } finally {
        setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 mb-20 animate-in zoom-in-95 duration-500">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="glass dark:bg-gray-800/40 rounded-[3rem] shadow-2xl border border-white/60 dark:border-white/5 overflow-hidden">
            <div className="p-10 md:p-14">
              <header className="mb-12">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Submit Inquiry</h2>
                <p className="text-gray-500 dark:text-gray-400 font-bold mt-1">Provide clear details for accurate help.</p>
              </header>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-1 gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Academic Category</label>
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
                  
                  <div className="flex flex-wrap gap-6 pt-2">
                    <label className="flex items-center cursor-pointer space-x-4 group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={formData.isAnonymous}
                          onChange={e => setFormData({...formData, isAnonymous: e.target.checked})}
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${formData.isAnonymous ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isAnonymous ? 'translate-x-4' : ''}`}></div>
                      </div>
                      <span className="text-xs font-black text-gray-500 uppercase tracking-widest group-hover:text-indigo-600">Post Anonymously</span>
                    </label>

                    <label className="flex items-center cursor-pointer space-x-4 group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={formData.enableSimilarityCheck}
                          onChange={e => setFormData({...formData, enableSimilarityCheck: e.target.checked})}
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${formData.enableSimilarityCheck ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.enableSimilarityCheck ? 'translate-x-4' : ''}`}></div>
                      </div>
                      <span className="text-xs font-black text-gray-500 uppercase tracking-widest group-hover:text-amber-600">Enable Anti-Duplicate</span>
                    </label>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Headline</label>
                    {formData.enableSimilarityCheck && (
                      <button 
                        type="button"
                        onClick={runSimilarityCheck}
                        disabled={isScanning || !formData.title}
                        className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest hover:underline disabled:opacity-30"
                      >
                        {isScanning ? 'Processing...' : 'Verify Uniqueness'}
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Briefly summarize your doubt..."
                    className="w-full px-6 py-4 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-primary-500/10 dark:text-white outline-none font-bold transition-all"
                    value={formData.title}
                    onChange={e => { setFormData({...formData, title: e.target.value}); setSimilarDoubts([]); setScanPerformed(false); }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Micro-Details</label>
                  <textarea
                    placeholder="Be specific for better explanations..."
                    rows={6}
                    className="w-full px-6 py-5 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/5 rounded-[2rem] focus:ring-4 focus:ring-primary-500/10 dark:text-white outline-none font-medium transition-all shadow-inner resize-none"
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    required
                  ></textarea>
                </div>

                <div className="flex items-center justify-between pt-10 border-t border-gray-100/50 dark:border-white/5">
                  <div className="flex items-center space-x-3 text-xs font-black uppercase text-gray-400">
                    <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-amber-500 animate-ping' : 'bg-green-500'}`} />
                    <span>{isScanning ? 'Repository Search In Progress' : 'System Ready'}</span>
                  </div>
                  <div className="flex space-x-4">
                    <button type="button" onClick={() => onSuccess()} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-800 transition-colors">Discard</button>
                    <button 
                      type="submit" 
                      disabled={isScanning}
                      className="px-10 py-4 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 shadow-xl shadow-primary-500/20 disabled:opacity-50 active:scale-95 transition-all"
                    >
                      {isScanning ? 'Wait...' : 'Publish'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Daily Quota Card */}
          <div className="glass bg-white/50 dark:bg-gray-800/40 p-8 rounded-[2.5rem] border border-white/60 dark:border-white/5 shadow-xl">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">Daily Quota</h3>
            <div className="flex justify-between items-end mb-4">
               <span className="text-4xl font-black text-gray-900 dark:text-white">{user.dailyLimit - user.doubtsPostedToday}</span>
               <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Available Posts</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
               <div 
                  className="bg-primary-500 h-full transition-all duration-1000" 
                  style={{ width: `${Math.max(0, ((user.dailyLimit - user.doubtsPostedToday) / user.dailyLimit) * 100)}%` }} 
                />
            </div>
          </div>

          {/* Similarity Results Card */}
          {(similarDoubts.length > 0 || (scanPerformed && similarDoubts.length === 0)) && (
            <div className={`glass p-8 rounded-[2.5rem] border-2 shadow-xl animate-in slide-in-from-right-8 duration-500 ${similarDoubts.length > 0 ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-500/30' : 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-500/30'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-sm font-black uppercase tracking-widest ${similarDoubts.length > 0 ? 'text-amber-800 dark:text-amber-400' : 'text-green-800 dark:text-green-400'}`}>
                  {similarDoubts.length > 0 ? 'Conflict Alert' : 'Unique Content'}
                </h3>
              </div>
              
              {similarDoubts.length > 0 ? (
                <>
                  <div className="space-y-4 mb-8">
                    {similarDoubts.map(d => (
                      <div key={d.id} className="p-4 bg-white/60 dark:bg-black/20 rounded-2xl border border-amber-100 dark:border-amber-900/20 text-xs font-bold text-gray-700 dark:text-gray-300">
                        {d.title}
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={handleForcePost}
                    className="w-full py-4 bg-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 shadow-lg"
                  >
                    Force Publish Anyway
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <p className="text-xs font-bold text-green-700 dark:text-green-400">No duplicates detected in repository.</p>
                </div>
              )}
            </div>
          )}

          {error && !similarDoubts.length && !scanPerformed && (
            <div className="p-6 bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-900/20 rounded-[2rem] animate-in fade-in">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-red-700 dark:text-red-400 text-[10px] font-black uppercase leading-tight tracking-wider">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDoubt;
