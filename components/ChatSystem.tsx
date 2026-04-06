import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../types';
import { academicDb } from '../services/dbService';
import { Send, User as UserIcon, Clock, Loader2, MessageSquare, ShieldCheck, Zap, Globe, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatSystemProps {
  user: User;
}

const ChatSystem: React.FC<ChatSystemProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojis = ['👍', '😀', '🙌', '🔥', '👀', '💯', '👏', '💡', '✅', '🤔', '🚀', '❤️', '🎉', '✨', '🧠'];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages(true);
    const interval = setInterval(() => fetchMessages(false), 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (isInitial = false) => {
    try {
      if (isInitial && messages.length === 0) setIsLoading(true);
      const data = await academicDb.getMessages();
      setMessages(data);
    } catch (err: any) {
      if (err.code === '42P01' || err.message?.includes('relation "messages" does not exist')) {
        setError('Database table "messages" is missing. Please use setup banner to initialize.');
      } else {
        setError('Failed to load messages. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      await academicDb.sendMessage(user.id, newMessage.trim());
      setNewMessage('');
      setError(null);
    } catch (err: any) {
      let errorMessage = err.message || 'Failed to send message.';
      if (err.code === '42P01' || err.message?.includes('relation "messages" does not exist')) {
        errorMessage = 'Database table "messages" is missing. See setup banner.';
      }
      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] max-w-5xl mx-auto glass-card premium-shadow rounded-[3rem] border-none bg-white dark:bg-[#1A1A1D]">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-gray-900 dark:text-white animate-spin" />
        </div>
        <p className="mt-6 text-gray-400 font-bold text-xs uppercase tracking-widest">Connecting to network...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[750px] max-w-5xl mx-auto glass-card premium-shadow rounded-[3rem] overflow-hidden border-none bg-white dark:bg-[#1A1A1D]">
      {/* Header */}
      <div className="px-10 py-8 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#202024]/50 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[1rem] flex items-center justify-center shadow-lg">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Discussions</h3>
            <div className="flex items-center space-x-2 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Encrypted Channel</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-[#D7F7E6] dark:bg-[#D7F7E6]/10 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-emerald-800 dark:text-[#D7F7E6] uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar bg-white dark:bg-[#1A1A1D]">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isOwn = msg.userId === user.id;
            const showAvatar = idx === 0 || messages[idx - 1].userId !== msg.userId;
            
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] group flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  {showAvatar && (
                    <div className={`flex items-center space-x-2 mb-2 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[9px] ${isOwn ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-[#202024] text-gray-900 dark:text-white'}`}>
                        {msg.username.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                        {isOwn ? 'You' : msg.username}
                      </span>
                    </div>
                  )}
                  
                  <div className={`relative px-6 py-4 rounded-[1.5rem] text-sm font-medium shadow-sm leading-relaxed ${
                    isOwn 
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-tr-sm' 
                      : 'bg-gray-100 dark:bg-[#202024] text-gray-800 dark:text-gray-200 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <div className={`mt-1 text-[9px] font-bold text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest ${isOwn ? 'mr-2' : 'ml-2'}`}>
                     {formatTime(msg.createdAt)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mx-10 mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl flex items-center justify-between border border-red-100 dark:border-red-900/30"
          >
            <p className="text-xs font-bold">{error}</p>
            <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-8 bg-gray-50/50 dark:bg-[#202024]/50 border-t border-gray-100 dark:border-white/5 relative">
        <form onSubmit={handleSendMessage} className="relative flex items-center space-x-4">
          <div className="relative">
            <button 
               type="button" 
               onClick={() => setShowEmojiPicker(!showEmojiPicker)}
               className="p-4 bg-white dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/10 rounded-[1.5rem] text-xl shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shrink-0"
               title="Add Emoji"
            >
               😀
            </button>
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 mb-4 p-4 bg-white dark:bg-[#202024] rounded-[1.5rem] shadow-xl border border-gray-100 dark:border-white/10 w-64 z-50 flex flex-wrap gap-2"
                >
                   {emojis.map(e => (
                     <button 
                       key={e} 
                       type="button"
                       onClick={() => { setNewMessage(prev => prev + e); setShowEmojiPicker(false); }}
                       className="w-10 h-10 flex items-center justify-center text-xl hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors hover:scale-110"
                     >
                       {e}
                     </button>
                   ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-6 py-4 bg-white dark:bg-[#1A1A1D] border border-gray-100 dark:border-transparent focus:ring-2 focus:ring-gray-900 dark:focus:ring-white rounded-[1.5rem] dark:text-white outline-none transition-all font-medium shadow-sm text-sm"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="p-4 bg-gray-900 dark:bg-white disabled:opacity-50 text-white dark:text-gray-900 rounded-[1.5rem] shadow-lg transition-transform hover:-translate-y-0.5 group shrink-0"
          >
            {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatSystem;
