import React, { useState, useRef } from 'react';
import { User, Doubt, Attachment } from '../types';
import { academicDb } from '../services/dbService';
import { motion, AnimatePresence } from 'motion/react';
import { Paperclip, Mic, Square, X, Image as ImageIcon, FileText, Music, Loader2, Send, Info, AlertTriangle, Trash2, Plus, Zap, Shield, HelpCircle } from 'lucide-react';

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
    checkSimilarity: true,
    attachments: [] as Attachment[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const [similarDoubts, setSimilarDoubts] = useState<Doubt[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleClear = () => {
    setFormData({
      ...formData,
      title: '',
      content: '',
      attachments: []
    });
    setError('');
    setSimilarDoubts([]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newAttachments: Attachment[] = [...formData.attachments];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const url = await academicDb.uploadFile(file);
        let type: Attachment['type'] = 'doc';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type === 'application/pdf') type = 'pdf';
        else if (file.type.startsWith('audio/')) type = 'voice';

        newAttachments.push({
          id: Math.random().toString(36).substring(2),
          url,
          name: file.name,
          type
        });
      } catch (err: any) {
        setError(`Upload failed: ${err.message}`);
      }
    }

    setFormData({ ...formData, attachments: newAttachments });
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], `voice_note_${Date.now()}.webm`, { type: 'audio/webm' });
        
        setIsUploading(true);
        try {
          const url = await academicDb.uploadFile(file);
          setFormData(prev => ({
            ...prev,
            attachments: [
              ...prev.attachments,
              {
                 id: Math.random().toString(36).substring(2),
                 url,
                 name: 'Voice Note',
                 type: 'voice'
              }
            ]
          }));
        } catch (err: any) {
          setError(`Voice upload failed: ${err.message}`);
        }
        setIsUploading(false);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      setError(`Microphone access denied: ${err.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const removeAttachment = (id: string) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter(a => a.id !== id)
    });
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
        const updatedUser = await academicDb.getUserProfile(); // refreshing user data simply
        onUpdateUser(updatedUser);
        onSuccess(force ? 'Inquiry pushed forcefully.' : 'Inquiry published successfully.');
      }
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
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
    <div className="max-w-[1400px] mx-auto pb-24">
      <div className="grid lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <div className="glass-card premium-shadow rounded-[3rem] p-10 md:p-14 border-none bg-white dark:bg-[#1A1A1D]">
            <header className="mb-10">
              <div className="w-12 h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Ask Doubt</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Detailed inquiries receive faster, verified answers from our expert scholars.</p>
            </header>

            <form onSubmit={(e) => handleSubmit(e)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1 mb-2">Subject Area</label>
                  <select 
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-[#202024] border-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white rounded-2xl outline-none font-bold text-sm dark:text-white transition-all shadow-sm appearance-none"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1 mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Understanding Big O Notation"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-[#202024] border-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white rounded-2xl outline-none font-bold text-sm dark:text-white transition-all shadow-sm"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1 mb-2">Problem Description</label>
                <textarea
                  placeholder="Explain exactly what you are stuck on..."
                  rows={6}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-[#202024] border-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white rounded-2xl outline-none font-medium text-sm dark:text-white transition-all shadow-sm resize-none custom-scrollbar"
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  required
                ></textarea>
              </div>

              {/* Attachments Section */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1 mb-2">Attachments</label>
                
                <div className="flex flex-wrap gap-3">
                  <AnimatePresence>
                    {formData.attachments.map(att => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={att.id} 
                        className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#202024] rounded-xl border border-gray-100 dark:border-white/5 shadow-sm"
                      >
                        <div className="flex items-center space-x-3">
                           <span className="text-gray-500">{getAttachmentIcon(att.type)}</span>
                           <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate max-w-[150px]">{att.name}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeAttachment(att.id)}
                          className="ml-3 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    multiple 
                    accept="image/*,application/pdf,.doc,.docx"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center space-x-2 px-6 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                    <span>Upload</span>
                  </button>

                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isUploading}
                    className={`flex items-center space-x-2 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-transform hover:-translate-y-0.5 shadow-lg ${
                      isRecording 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-white dark:bg-[#202024] text-gray-900 dark:text-white border border-gray-100 dark:border-white/5'
                    }`}
                  >
                    {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isRecording ? 'Stop' : 'Voice'}</span>
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-100 dark:border-white/5">
                {/* Similarity Check Toggle */}
                <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-[#202024] rounded-2xl shadow-sm">
                  <div>
                    <span className="block text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest mb-1">Check Similarity</span>
                    <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest">Find duplicates before posting</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, checkSimilarity: !formData.checkSimilarity})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.checkSimilarity ? 'bg-gray-900 dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-900 transition-transform ${formData.checkSimilarity ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Anonymous Toggle */}
                <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-[#202024] rounded-2xl shadow-sm">
                  <div>
                    <span className="block text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest mb-1">Anonymous</span>
                    <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest">Hide your identity</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, isAnonymous: !formData.isAnonymous})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.isAnonymous ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isAnonymous ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {similarDoubts.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="p-8 bg-[#FFEADB] dark:bg-[#FFEADB]/90 rounded-3xl"
                  >
                    <div className="flex items-center space-x-3 mb-6 text-orange-900">
                      <AlertTriangle className="w-6 h-6" />
                      <h4 className="text-xl font-black tracking-tight">Similar Doubts Found</h4>
                    </div>
                    
                    <div className="space-y-3 mb-8">
                      {similarDoubts.map(d => (
                        <div key={d.id} className="p-4 bg-white/60 dark:bg-black/20 rounded-xl text-xs font-bold text-orange-900">
                           {d.title}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                         type="button" onClick={() => setSimilarDoubts([])}
                         className="flex-1 py-4 bg-white/80 dark:bg-black/30 text-orange-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-colors"
                      >
                         Edit Inquiry
                      </button>
                      <button 
                         type="button" onClick={(e) => handleSubmit(e, true)}
                         className="flex-1 py-4 bg-orange-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-lg"
                      >
                         Post Anyway
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100 dark:border-white/5">
                <button 
                  type="button" 
                  onClick={handleClear}
                  className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Clear
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || isUploading}
                  className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 shadow-xl transition-all disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSubmitting ? (
                     <><Loader2 className="w-4 h-4 animate-spin" /><span>Validating...</span></>
                  ) : (
                     <><Send className="w-4 h-4 mr-1" /><span>Submit</span></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card premium-shadow rounded-[3rem] p-8 border-none bg-blue-50 dark:bg-blue-900/10"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-white dark:bg-[#1A1A1D] rounded-xl flex items-center justify-center shadow-sm text-blue-500">
                 <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Post Quota</h3>
            </div>
            
            <div className="flex justify-between items-end mb-4">
               <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">{(user.dailyLimit || 5) - (user.doubtsPostedToday || 0)}</span>
               <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Available</span>
            </div>
            
            <div className="w-full bg-white dark:bg-[#1A1A1D] h-2 rounded-full overflow-hidden shadow-inner mb-6">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(((user.dailyLimit || 5) - (user.doubtsPostedToday || 0)) / (user.dailyLimit || 5)) * 100}%` }}
                 transition={{ duration: 1 }}
                 className="bg-blue-500 h-full rounded-full" 
               />
            </div>
            
            <p className="text-xs font-medium text-gray-500 leading-relaxed bg-white/50 dark:bg-black/20 p-4 rounded-2xl">
              Post limit refreshes daily. Earn more quota by contributing high-quality answers to peer inquiries.
            </p>
          </motion.div>
          
          <AnimatePresence>
            {error && similarDoubts.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-3xl flex items-start space-x-4 border border-red-100 dark:border-red-900/30"
              >
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs font-bold">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PostDoubt;
