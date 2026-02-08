
import React, { useEffect } from 'react';

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

  const styles = {
    success: 'bg-emerald-500/90 border-emerald-400 text-white shadow-emerald-500/20',
    error: 'bg-red-500/90 border-red-400 text-white shadow-red-500/20',
    warning: 'bg-amber-500/90 border-amber-400 text-white shadow-amber-500/20'
  };

  const icons = {
    success: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    error: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
    warning: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
  };

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center p-4 min-w-[320px] rounded-2xl border backdrop-blur-md shadow-2xl animate-in slide-in-from-bottom-10 duration-500 ${styles[type]}`}>
      <div className="flex-shrink-0 mr-3">
        {icons[type]}
      </div>
      <div className="flex-grow pr-4">
        <p className="text-sm font-black uppercase tracking-wider">{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="flex-shrink-0 hover:scale-110 active:scale-90 transition-transform opacity-60 hover:opacity-100"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
};

export default Toast;
