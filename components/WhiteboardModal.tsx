
import React, { useRef, useEffect, useState } from 'react';

interface WhiteboardModalProps {
  onClose: () => void;
}

const WhiteboardModal: React.FC<WhiteboardModalProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(4);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = 450;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
       const ctx = canvas.getContext('2d');
       ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;

    let x, y;
    if ('touches' in e) {
       const rect = canvas.getBoundingClientRect();
       x = e.touches[0].clientX - rect.left;
       y = e.touches[0].clientY - rect.top;
    } else {
       x = e.nativeEvent.offsetX;
       y = e.nativeEvent.offsetY;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="glass dark:bg-gray-800/60 rounded-[3rem] shadow-2xl w-full max-w-5xl overflow-hidden border border-white/40 dark:border-white/10 animate-in zoom-in-95 duration-500">
        <div className="flex justify-between items-center p-8 md:p-10 border-b border-gray-100/50 dark:border-white/5 transition-colors">
          <div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Visual Logic Studio</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mt-1">Diagramming concepts for maximum clarity.</p>
          </div>
          <button onClick={onClose} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all active:scale-90">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-8 md:p-10 bg-gray-50/50 dark:bg-black/20 transition-colors">
          <div className="flex flex-wrap items-center gap-8 mb-8 p-6 glass bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-white/60 dark:border-white/5 transition-colors">
            <div className="flex space-x-3">
              {['#3b82f6', '#ef4444', '#10b981', '#000000', '#f59e0b'].map(c => (
                <button 
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-xl border-4 transition-all hover:scale-110 active:scale-90 shadow-md ${color === c ? 'border-primary-500 ring-4 ring-primary-500/20' : 'border-white/10'}`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-gray-700 transition-colors" />
            <div className="flex items-center space-x-5 flex-grow max-w-xs">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest transition-colors">Brush Stroke</span>
              <input 
                type="range" min="1" max="40" 
                value={brushSize} 
                onChange={e => setBrushSize(parseInt(e.target.value))}
                className="flex-grow h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary-600 transition-colors"
              />
            </div>
            <div className="flex-grow" />
            <button 
              onClick={clearCanvas}
              className="px-6 py-3 bg-red-600 text-white text-[11px] font-black rounded-2xl hover:bg-red-700 transition-all uppercase tracking-widest active:scale-95 shadow-lg shadow-red-600/20"
            >
              Flush Canvas
            </button>
          </div>
          
          <div className="relative border-8 border-white dark:border-gray-800 rounded-[2.5rem] bg-white shadow-2xl cursor-crosshair overflow-hidden h-[450px] transition-colors group">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-40"></div>
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
        </div>
        
        <div className="p-8 md:p-10 flex items-center justify-between bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-white/5 transition-colors">
           <div className="flex items-center text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] transition-colors">
             <div className="w-2 h-2 rounded-full bg-green-500 mr-3 animate-pulse shadow-lg shadow-green-500/50" />
             Active Session • Local Prototyping Mode
           </div>
           <button 
            onClick={onClose}
            className="px-10 py-4 bg-gradient-to-r from-primary-600 to-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:scale-105 shadow-2xl shadow-primary-500/30 transition-all active:scale-95"
          >
            Finalize Sketch
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhiteboardModal;
