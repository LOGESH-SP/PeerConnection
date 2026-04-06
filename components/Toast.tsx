
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const variants = {
    success: {
      bg: 'bg-emerald-500 dark:bg-emerald-600',
      icon: <CheckCircle2 className="w-5 h-5" />,
      shadow: 'shadow-emerald-500/20'
    },
    error: {
      bg: 'bg-red-500 dark:bg-red-600',
      icon: <AlertCircle className="w-5 h-5" />,
      shadow: 'shadow-red-500/20'
    },
    warning: {
      bg: 'bg-amber-500 dark:bg-amber-600',
      icon: <AlertTriangle className="w-5 h-5" />,
      shadow: 'shadow-amber-500/20'
    }
  };

  const current = variants[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: '-50%', scale: 0.9 }}
      animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
      exit={{ opacity: 0, y: 20, x: '-50%', scale: 0.95 }}
      className={`fixed bottom-12 left-1/2 z-[200] flex items-center p-5 min-w-[340px] max-w-md rounded-2xl shadow-2xl backdrop-blur-xl border border-white/20 ${current.bg} ${current.shadow} text-white`}
    >
      <div className="flex-shrink-0 mr-4 p-2 bg-white/20 rounded-xl">
        {current.icon}
      </div>
      <div className="flex-grow pr-6">
        <p className="text-[11px] font-black uppercase tracking-widest leading-tight">{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      
      {/* Progress bar */}
      <motion.div 
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: "linear" }}
        className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full"
      />
    </motion.div>
  );
};

export default Toast;

