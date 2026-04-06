import React, { useState, useEffect, useRef } from 'react';
import { Doubt, Answer, User, UserRole, Attachment } from '../types';
import { academicDb } from '../services/dbService';
import { aiDetection } from '../services/aiDetectionService';
import { aiAnswerValidation, ValidationResult } from '../services/aiAnswerValidationService';
import { motion, AnimatePresence } from 'motion/react';
import { Paperclip, Mic, Square, X, Image as ImageIcon, FileText, Music, Loader2, ExternalLink, BrainCircuit, CheckCircle2, ChevronRight, MessageSquare, ShieldCheck, AlertCircle, Plus, Trash2, ThumbsUp, ThumbsDown, Star, AlertTriangle, Flag, RefreshCw, History } from 'lucide-react';

interface AnswerListProps {
  doubt: Doubt;
  currentUser: User;
  onUpdate: () => void;
}

const AnswerList: React.FC<AnswerListProps> = ({ doubt, currentUser, onUpdate }) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    step1: '', 
    step2: '', 
    step3: '',
    attachments: [] as Attachment[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [hasValidated, setHasValidated] = useState(false);
  const [aiResult, setAiResult] = useState<{ probability: number; explanation: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const fetchAnswers = async () => {
      const data = await academicDb.getAnswers(doubt.id);
      setAnswers(data);
    };
    fetchAnswers();
  }, [doubt.id]);

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

  const handleCheckAI = async () => {
    const fullText = `${formData.step1} ${formData.step2} ${formData.step3}`.trim();
    if (!fullText) {
      setError('Please write your answer before checking.');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAiResult(null);

    try {
      const result = await aiDetection.analyzeAnswer(fullText);
      setAiResult(result);
    } catch (err: any) {
      setError(`AI Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCheckAnswer = async () => {
    const fullText = `${formData.step1} ${formData.step2} ${formData.step3}`.trim();
    if (!fullText) {
      setError('Please write your answer before checking.');
      return;
    }

    setIsValidating(true);
    setError('');
    setValidationResult(null);

    try {
      const question = `${doubt.title}\n${doubt.description}`;
      const result = await aiAnswerValidation.validateAnswer(question, fullText);
      setValidationResult(result);
      setHasValidated(true);
    } catch (err: any) {
      setError(`Validation failed: ${err.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (aiResult && aiResult.probability > 40) {
      setError('Your answer appears to be AI-generated. Please rewrite it in your own words to publish.');
      return;
    }

    const fullText = `${formData.step1} ${formData.step2} ${formData.step3}`.trim();
    if (!fullText) {
      setError('At least one step is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await academicDb.postAnswer(currentUser.id, doubt.id, formData);
      const updatedAnswers = await academicDb.getAnswers(doubt.id);
      setAnswers(updatedAnswers);
      setFormData({ step1: '', step2: '', step3: '', attachments: [] });
      setAiResult(null);
      setValidationResult(null);
      setHasValidated(false);
      setShowForm(false);
      onUpdate(); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAIColorClass = (prob: number) => {
    if (prob <= 30) return 'text-emerald-700 bg-emerald-50 dark:bg-[#D7F7E6]/20 border-emerald-200 dark:border-emerald-800/40';
    if (prob <= 70) return 'text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/40';
    return 'text-rose-700 bg-rose-50 dark:bg-[#FDE2DF]/20 border-rose-200 dark:border-rose-800/40';
  };

  const getAILabel = (prob: number) => {
    if (prob <= 30) return 'Likely Human';
    if (prob <= 70) return 'Uncertain';
    return 'Likely AI-generated';
  };

  const handleVerify = async (id: number) => {
    await academicDb.verifyAnswer(id, currentUser.id);
    const updatedAnswers = await academicDb.getAnswers(doubt.id);
    setAnswers(updatedAnswers);
    onUpdate();
  };

  const getAttachmentIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'voice': return <Music className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleFeedback = async (id: number, isHelpful: boolean) => {
      try {
          await academicDb.postFeedback(id, isHelpful);
          onUpdate();
      } catch (e: any) {
          setError(e.message);
      }
  };

  const handleFlag = async (id: number) => {
      try {
          await academicDb.flagAnswer(id, "Unclear or Incorrect");
          onUpdate();
      } catch (e: any) {
          setError(e.message);
      }
  };

  const handleRecheck = async (id: number) => {
      try {
          await academicDb.recheckAnswer(id);
          onUpdate();
      } catch (e: any) {
          setError(e.message);
      }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-900 dark:text-white">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Structured Solutions</h4>
        </div>
        {!showForm && currentUser.role === UserRole.STUDENT && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>Contribute</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit} 
            className="glass-card p-8 md:p-10 rounded-[2.5rem] border-none shadow-xl space-y-8 bg-blue-50/50 dark:bg-[#1A1A1D]"
          >
            <div className="space-y-6">
              {[1, 2, 3].map(step => (
                <div key={step}>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1 mb-2">
                    Step 0{step} {step === 1 && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      className="w-full px-5 py-4 bg-white dark:bg-[#202024] border-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white rounded-xl dark:text-white outline-none font-medium text-sm shadow-sm"
                      placeholder={step === 1 ? "The fundamental principle..." : step === 2 ? "The application process..." : "The definitive result..."}
                      value={(formData as any)[`step${step}`]}
                      onChange={e => setFormData({...formData, [`step${step}`]: e.target.value})}
                      required={step === 1}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Attachments Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-white/5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1">Supporting Evidence</label>
              <div className="flex flex-wrap gap-3">
                <AnimatePresence>
                  {formData.attachments.map(att => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                      key={att.id} 
                      className="flex items-center space-x-2 px-3 py-1.5 bg-white dark:bg-[#202024] rounded-lg border border-gray-100 dark:border-white/5 shadow-sm"
                    >
                      <span className="text-gray-400">{getAttachmentIcon(att.type)}</span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate max-w-[100px]">{att.name}</span>
                      <button type="button" onClick={() => removeAttachment(att.id)} className="ml-2 text-gray-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input 
                  type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*,application/pdf,.doc,.docx"
                />
                <button
                  type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                  className="flex items-center space-x-2 px-5 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                  <span>Attach</span>
                </button>

                <button
                  type="button" onClick={isRecording ? stopRecording : startRecording} disabled={isUploading || isAnalyzing}
                  className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-transform hover:-translate-y-0.5 ${
                    isRecording 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-white dark:bg-[#202024] text-gray-900 dark:text-white border border-gray-100 dark:border-white/5'
                  }`}
                >
                  {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isRecording ? 'Stop' : 'Voice'}</span>
                </button>

                <div className="h-8 w-px bg-gray-200 dark:bg-white/10 mx-2 hidden sm:block"></div>

                <button
                  type="button" onClick={handleCheckAI} disabled={isAnalyzing || isUploading || isValidating}
                  className="flex items-center space-x-2 px-5 py-3 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                  <span>Check AI</span>
                </button>

                <button
                  type="button" onClick={handleCheckAnswer} disabled={isValidating || isUploading || isAnalyzing}
                  className="flex items-center space-x-2 px-5 py-3 bg-[#D7F7E6] text-emerald-800 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Check Correctness</span>
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl flex items-center space-x-3 font-bold text-xs"
                >
                  <AlertCircle className="w-4 h-4" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {aiResult && aiResult.probability > 40 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-xl flex items-center space-x-3 font-bold text-xs"
                >
                  <BrainCircuit className="w-4 h-4" />
                  <p>AI-generated content detected. Please rewrite.</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {validationResult && (validationResult.relevance_score < 50 || validationResult.correctness_score < 50) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-xl flex items-center space-x-3 font-bold text-xs"
                >
                  <AlertCircle className="w-4 h-4" />
                  <p>Insufficient correctness or relevance scores. Please revise.</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {(isAnalyzing || isValidating) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center p-8 bg-white dark:bg-[#202024] rounded-2xl border border-gray-100 dark:border-white/5"
                >
                  <Loader2 className="w-8 h-8 text-gray-900 dark:text-white animate-spin mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    {isAnalyzing ? "Analyzing Authenticity..." : "Evaluating Quality..."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {validationResult && !isValidating && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-2xl transition-all duration-500 ${validationResult.relevance_score >= 50 && validationResult.correctness_score >= 50 ? 'text-emerald-800 bg-[#D7F7E6] dark:bg-[#D7F7E6]/20' : 'text-rose-800 bg-[#FDE2DF] dark:bg-[#FDE2DF]/20'}`}
                >
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/50 dark:bg-black/20 p-4 rounded-xl">
                      <span className="block text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Relevance</span>
                      <span className="text-2xl font-black">{validationResult.relevance_score}%</span>
                    </div>
                    <div className="bg-white/50 dark:bg-black/20 p-4 rounded-xl">
                      <span className="block text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Correctness</span>
                      <span className="text-2xl font-black">{validationResult.correctness_score}%</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 opacity-80" />
                    <p className="text-xs font-bold leading-relaxed">
                      {validationResult.feedback}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {aiResult && !isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-2xl transition-all duration-500 ${getAIColorClass(aiResult.probability)} font-bold`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <BrainCircuit className="w-5 h-5" />
                    <div>
                      <h5 className="text-sm font-black uppercase tracking-widest">AI Likelihood: {aiResult.probability}%</h5>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    {aiResult.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-white/5">
              <button 
                type="button" 
                onClick={() => { setShowForm(false); setAiResult(null); setValidationResult(null); setHasValidated(false); }} 
                className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || isUploading || isAnalyzing || isValidating || !hasValidated || (validationResult && (validationResult.relevance_score < 50 || validationResult.correctness_score < 50)) || (aiResult !== null && aiResult.probability > 40)} 
                className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 shadow-xl transition-transform disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Solution'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid gap-6">
        <AnimatePresence mode="popLayout">
          {answers.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 bg-white/50 dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/5"
            >
               <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-4" />
               <p className="text-gray-400 font-bold text-sm">Be the first to share an insight.</p>
            </motion.div>
          ) : (
            answers.map(ans => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                key={ans.id} 
                className={`p-8 md:p-10 rounded-[2.5rem] transition-all duration-500 shadow-sm border-none group ${ans.isVerified ? 'bg-[#D7F7E6]/40 dark:bg-[#D7F7E6]/10' : 'bg-white dark:bg-[#1A1A1D]'}`}
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center text-lg font-black text-white dark:text-gray-900 shadow-md">
                      {ans.username[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="block text-base font-black text-gray-900 dark:text-white">{ans.username}</span>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md ${ans.trustScore && ans.trustScore > 50 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ans.trustScore && ans.trustScore > 10 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30'}`}>
                           Trust: {ans.trustScore || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end items-center gap-2">
                    {(ans.is_best_answer || ans.is_best_answer_computed) && (
                        <div className="flex items-center space-x-1 text-yellow-800 bg-[#FFEADB] dark:bg-[#FFEADB]/20 dark:text-[#FFEADB] px-3 py-1.5 rounded-lg">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Best</span>
                        </div>
                    )}
                    {(ans.ai_confidence !== undefined) && (
                        <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${ans.ai_confidence > 80 ? 'text-blue-800 bg-[#E2F2FF] dark:bg-[#E2F2FF]/20 dark:text-[#E2F2FF]' : ans.ai_confidence > 50 ? 'text-indigo-800 bg-indigo-100 dark:bg-indigo-900/30' : 'text-gray-800 bg-gray-100 dark:bg-gray-800'}`}>
                          <BrainCircuit className="w-3 h-3" />
                          <span className="text-[9px] font-black uppercase tracking-widest">AI: {ans.ai_confidence}%</span>
                        </div>
                    )}
                    {ans.is_under_review && (
                        <div className="flex items-center space-x-1 text-rose-800 bg-[#FDE2DF] dark:bg-[#FDE2DF]/20 dark:text-[#FDE2DF] px-3 py-1.5 rounded-lg">
                          <AlertTriangle className="w-3 h-3" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Review</span>
                        </div>
                    )}
                    {ans.isVerified && (
                        <div className="flex items-center space-x-1.5 text-emerald-800 bg-[#D7F7E6] dark:bg-emerald-900/30 dark:text-[#D7F7E6] px-3 py-1.5 rounded-lg">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Verified</span>
                        </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  {[ans.step1, ans.step2, ans.step3].filter(Boolean).map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-0.5 text-sm font-black text-gray-300 dark:text-gray-600">
                        0{idx + 1}.
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>

                {/* Answer Attachments */}
                {ans.attachments && ans.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-8">
                    {ans.attachments.map(att => (
                      <a 
                        key={att.id} href={att.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-[#202024] rounded-xl border border-gray-100 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-gray-500">{getAttachmentIcon(att.type)}</span>
                        <span className="truncate max-w-[120px]">{att.name}</span>
                      </a>
                    ))}
                  </div>
                )}

                {currentUser.role === UserRole.MENTOR && !ans.isVerified && (
                  <button 
                    onClick={() => handleVerify(ans.id)}
                    className="w-full py-4 bg-[#D7F7E6] text-emerald-800 dark:bg-emerald-900 border-none hover:brightness-95 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 mb-6"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Answer</span>
                  </button>
                )}
                
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => handleFeedback(ans.id, true)} className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#202024] hover:bg-[#D7F7E6] dark:hover:bg-emerald-900/30 text-[10px] uppercase tracking-widest font-black text-gray-500 hover:text-emerald-700 transition-colors">
                            <ThumbsUp className="w-3.5 h-3.5"/> 
                            <span>{ans.upvotes ? `(${ans.upvotes})` : ''}</span>
                        </button>
                        <button onClick={() => handleFeedback(ans.id, false)} className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#202024] hover:bg-[#FDE2DF] dark:hover:bg-rose-900/30 text-[10px] uppercase tracking-widest font-black text-gray-500 hover:text-rose-700 transition-colors">
                            <ThumbsDown className="w-3.5 h-3.5"/> 
                            <span>{ans.downvotes ? `(${ans.downvotes})` : ''}</span>
                        </button>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <button onClick={() => handleRecheck(ans.id)} title="Recheck" className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                            <RefreshCw className="w-4 h-4"/> 
                        </button>
                        {!ans.is_under_review && (
                            <button onClick={() => handleFlag(ans.id)} className="p-2 text-gray-400 hover:text-rose-500 transition-colors">
                                <Flag className="w-4 h-4"/> 
                            </button>
                        )}
                    </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnswerList;
