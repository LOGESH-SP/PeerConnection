
import React, { useRef, useEffect, useState } from 'react';

interface WhiteboardModalProps {
  onClose: () => void;
}

const WhiteboardModal: React.FC<WhiteboardModalProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(4);
  const [isErasing, setIsErasing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        // Save current content before resizing
        const tempImage = canvas.toDataURL();
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Restore content
        const img = new Image();
        img.src = tempImage;
        img.onload = () => ctx.drawImage(img, 0, 0);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Initial history state
    saveToHistory();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setHistory(prev => [...prev.slice(-19), canvas.toDataURL()]);
    }
  };

  const undo = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const prevState = newHistory[newHistory.length - 1];
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && prevState) {
      const img = new Image();
      img.src = prevState;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      setHistory(newHistory);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const endDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
         const ctx = canvas.getContext('2d');
         ctx?.beginPath();
         saveToHistory();
      }
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.strokeStyle = isErasing ? (document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff') : color;
    ctx.lineWidth = isErasing ? brushSize * 4 : brushSize;
    ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';

    let x, y;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
       x = e.touches[0].clientX - rect.left;
       y = e.touches[0].clientY - rect.top;
    } else {
       x = e.nativeEvent.clientX - rect.left;
       y = e.nativeEvent.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `academic-diagram-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-gray-900/90 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="glass dark:bg-gray-900/80 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] w-full max-w-7xl h-full max-h-[90vh] overflow-hidden border border-white/20 dark:border-white/5 flex flex-col animate-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 md:p-8 border-b border-gray-100 dark:border-white/5 bg-white/10 dark:bg-black/20">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse" />
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">Visual Logic Studio</h3>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Advanced Conceptual Modeling Tool</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={downloadImage}
              className="hidden md:flex items-center space-x-2 px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span>Export PNG</span>
            </button>
            <button onClick={onClose} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all active:scale-90">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        
        <div className="flex-grow flex overflow-hidden">
          {/* Sidebar Tools */}
          <div className="w-20 md:w-24 border-r border-gray-100 dark:border-white/5 bg-white/50 dark:bg-black/20 p-4 flex flex-col items-center space-y-6 overflow-y-auto custom-scrollbar">
            
            {/* Tool Selection */}
            <div className="space-y-3">
              <button 
                onClick={() => setIsErasing(false)}
                className={`p-4 rounded-2xl transition-all shadow-lg ${!isErasing ? 'bg-primary-600 text-white shadow-primary-500/30 scale-110' : 'bg-white dark:bg-gray-800 text-gray-400 hover:bg-gray-50'}`}
                title="Brush"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
              <button 
                onClick={() => setIsErasing(true)}
                className={`p-4 rounded-2xl transition-all shadow-lg ${isErasing ? 'bg-primary-600 text-white shadow-primary-500/30 scale-110' : 'bg-white dark:bg-gray-800 text-gray-400 hover:bg-gray-50'}`}
                title="Eraser"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>

            <div className="w-8 h-px bg-gray-200 dark:bg-white/10" />

            {/* Actions */}
            <div className="space-y-3">
              <button 
                onClick={undo}
                disabled={history.length <= 1}
                className="p-4 bg-white dark:bg-gray-800 rounded-2xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-md active:scale-95 disabled:opacity-30 disabled:grayscale"
                title="Undo"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
              </button>
              <button 
                onClick={clearCanvas}
                className="p-4 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl hover:bg-red-100 transition-all shadow-md active:scale-95"
                title="Clear All"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7M4 7h16" /></svg>
              </button>
            </div>

            <div className="w-8 h-px bg-gray-200 dark:bg-white/10" />

            {/* View Settings */}
            <button 
              onClick={() => setShowGrid(!showGrid)}
              className={`p-4 rounded-2xl transition-all ${showGrid ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'bg-white dark:bg-gray-800 text-gray-400'}`}
              title="Toggle Grid"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
            </button>
          </div>

          {/* Canvas Area */}
          <div className="flex-grow flex flex-col relative bg-gray-50 dark:bg-gray-950 p-6 md:p-10">
            {/* Color & Size Overlay */}
            <div className="absolute top-10 left-10 right-10 z-20 flex flex-wrap items-center justify-between gap-6 px-8 py-4 glass dark:bg-gray-800/80 rounded-3xl border border-white/40 shadow-2xl animate-in slide-in-from-top-4">
              <div className="flex items-center space-x-4">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Palette</span>
                <div className="flex space-x-2">
                  {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#000000', '#6366f1'].map(c => (
                    <button 
                      key={c}
                      onClick={() => { setColor(c); setIsErasing(false); }}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 active:scale-90 shadow-md ${color === c && !isErasing ? 'border-primary-500 ring-4 ring-primary-500/20 scale-125' : 'border-white dark:border-gray-700'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-6 flex-grow max-w-sm">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Stroke Weight</span>
                <input 
                  type="range" min="1" max="40" 
                  value={brushSize} 
                  onChange={e => setBrushSize(parseInt(e.target.value))}
                  className="flex-grow h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary-600"
                />
                <span className="text-[10px] font-black text-gray-500 w-6">{brushSize}px</span>
              </div>
            </div>

            {/* Actual Canvas */}
            <div className={`relative flex-grow border-4 border-white dark:border-gray-800 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-2xl cursor-crosshair overflow-hidden group transition-all`}>
              {showGrid && (
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60"></div>
              )}
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={endDrawing}
                onMouseMove={draw}
                onMouseOut={endDrawing}
                onTouchStart={startDrawing}
                onTouchEnd={endDrawing}
                onTouchMove={draw}
                className="w-full h-full block relative z-10"
              />
            </div>

            {/* Footer Bar */}
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-lg shadow-green-500/50" />
                  Real-time Buffer Active
                </div>
                <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] px-3 py-1 bg-white dark:bg-gray-800 rounded-lg">
                  Actions: {history.length - 1}
                </div>
              </div>
              <button 
                onClick={onClose}
                className="px-12 py-3.5 bg-gradient-to-r from-primary-600 to-indigo-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] hover:scale-105 shadow-2xl shadow-primary-500/30 transition-all active:scale-95"
              >
                Sync with Inquiry
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhiteboardModal;
