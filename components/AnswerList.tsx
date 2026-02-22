
import React, { useState, useEffect } from 'react';
import { Doubt, Answer, User, UserRole } from '../types';
import { academicDb } from '../services/dbService';

interface AnswerListProps {
  doubt: Doubt;
  currentUser: User;
  onUpdate: () => void;
}

const AnswerList: React.FC<AnswerListProps> = ({ doubt, currentUser, onUpdate }) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ step1: '', step2: '', step3: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnswers = async () => {
      const data = await academicDb.getAnswers(doubt.id);
      setAnswers(data);
    };
    fetchAnswers();
  }, [doubt.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.step1.trim()) {
      setError('At least one step is required.');
      return;
    }

    await academicDb.postAnswer(currentUser.id, doubt.id, formData);
    const updatedAnswers = await academicDb.getAnswers(doubt.id);
    setAnswers(updatedAnswers);
    setFormData({ step1: '', step2: '', step3: '' });
    setShowForm(false);
    setError('');
    onUpdate(); 
  };

  const handleVerify = async (id: number) => {
    await academicDb.verifyAnswer(id, currentUser.id);
    const updatedAnswers = await academicDb.getAnswers(doubt.id);
    setAnswers(updatedAnswers);
    onUpdate();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-6 bg-primary-500 rounded-full" />
          <h4 className="text-xl font-black text-gray-900 dark:text-white">Structured Solutions</h4>
        </div>
        {!showForm && currentUser.role === UserRole.STUDENT && (
          <button 
            onClick={() => setShowForm(true)}
            className="group flex items-center space-x-2 text-primary-600 dark:text-primary-400 text-sm font-black uppercase tracking-widest hover:scale-105 transition-all"
          >
            <span className="p-1 rounded-lg bg-primary-100 dark:bg-primary-900/30 group-hover:rotate-90 transition-transform"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg></span>
            <span>Contribute</span>
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass dark:bg-gray-800/40 p-8 rounded-[2rem] border-2 border-primary-100 dark:border-primary-900/30 space-y-6 animate-in slide-in-from-top-6 duration-300">
          <div className="space-y-6">
            {[1, 2, 3].map(step => (
              <div key={step}>
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">
                  Micro Step 0{step} {step === 1 && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-3 text-primary-500 font-black opacity-30">#</div>
                  <input
                    className="w-full pl-10 pr-5 py-3.5 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/5 rounded-2xl dark:text-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-200 font-medium"
                    placeholder={step === 1 ? "The fundamental principle..." : step === 2 ? "The application process..." : "The definitive result..."}
                    value={(formData as any)[`step${step}`]}
                    onChange={e => setFormData({...formData, [`step${step}`]: e.target.value})}
                    required={step === 1}
                  />
                </div>
              </div>
            ))}
          </div>
          {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 dark:bg-red-900/20 py-3 rounded-xl">{error}</p>}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-xs font-black uppercase text-gray-500 hover:text-gray-800 dark:hover:text-white">Dismiss</button>
            <button type="submit" className="px-8 py-3 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 shadow-lg shadow-primary-500/20 active:scale-95 transition-all">Publish</button>
          </div>
        </form>
      )}

      <div className="grid gap-6">
        {answers.length === 0 ? (
          <div className="text-center py-12 glass rounded-3xl border-gray-100 dark:border-white/5">
             <p className="text-gray-400 dark:text-gray-500 font-bold italic">Curiosity awaits an answer. Be the first!</p>
          </div>
        ) : (
          answers.map(ans => (
            <div 
              key={ans.id} 
              className={`p-8 rounded-[2rem] border transition-all duration-500 hover:shadow-2xl ${ans.isVerified ? 'glass-green bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-500/30' : 'glass border-gray-100 dark:border-white/5'}`}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-sm font-black text-white shadow-md">
                    {ans.username[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="block text-sm font-black text-gray-900 dark:text-white">{ans.username}</span>
                    <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-widest">Knowledge Contributor</span>
                  </div>
                </div>
                {ans.isVerified && (
                  <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 bg-green-100/60 dark:bg-green-900/30 px-4 py-1.5 rounded-xl border border-green-200 dark:border-green-800/40">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-wider">Verified Solution</span>
                  </div>
                )}
              </div>

              <div className="space-y-6 mb-8">
                {[ans.step1, ans.step2, ans.step3].filter(Boolean).map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-6 group">
                    <div className="flex-shrink-0 w-8 h-8 glass dark:bg-gray-700/50 rounded-xl flex items-center justify-center text-xs font-black text-primary-600 dark:text-primary-400 mt-1 shadow-sm border border-primary-100/50 dark:border-primary-900/20">
                      0{idx + 1}
                    </div>
                    <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed font-medium pt-1.5">{step}</p>
                  </div>
                ))}
              </div>

              {currentUser.role === UserRole.MENTOR && !ans.isVerified && (
                <button 
                  onClick={() => handleVerify(ans.id)}
                  className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-lg shadow-green-600/20"
                >
                  Verify Excellence
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnswerList;
