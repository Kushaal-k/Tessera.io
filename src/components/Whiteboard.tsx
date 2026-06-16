import React, { useRef, useState, useEffect } from 'react';
import { Pen, Eraser, Share2, MousePointer2 } from 'lucide-react';

export const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [color, setColor] = useState('#06b6d4'); // Default cyan
  
  // Bob's simulated cursor
  const [bobPos, setBobPos] = useState({ x: 100, y: 100 });
  const [isBobDrawing, setIsBobDrawing] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 600;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.lineWidth = 3;
        setCtx(context);
      }
    }
  }, []);

  // Simulated Collaborative Drawing (Bob)
  useEffect(() => {
    let animationFrameId: number;
    let step = 0;
    
    const animateBob = () => {
      step += 0.05;
      const newX = 300 + Math.sin(step) * 150;
      const newY = 250 + Math.cos(step * 0.5) * 100;
      
      setBobPos({ x: newX, y: newY });
      
      if (ctx && isBobDrawing) {
        ctx.strokeStyle = '#a855f7'; // Bob's purple color
        ctx.lineTo(newX, newY);
        ctx.stroke();
      }
      
      animationFrameId = requestAnimationFrame(animateBob);
    };

    // Make Bob draw intermittently
    const intervalId = setInterval(() => {
      setIsBobDrawing(prev => {
        if (!prev && ctx) {
          ctx.beginPath();
          ctx.moveTo(bobPos.x, bobPos.y);
        }
        return !prev;
      });
    }, 3000);

    animateBob();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(intervalId);
    };
  }, [ctx, isBobDrawing]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    ctx.strokeStyle = color;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div className="flex-1 flex flex-col p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Share2 className="text-purple-400" size={24} />
            Live Architecture Whiteboard
          </h2>
          <p className="text-sm text-slate-400">Phase 3: WebRTC Real-Time Canvas</p>
        </div>
        
        {/* Toolbar */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
          <button className="p-2 rounded hover:bg-slate-800 text-cyan-400 bg-slate-800/50" title="Pen">
            <Pen size={18} />
          </button>
          <button className="p-2 rounded hover:bg-slate-800 text-slate-400" title="Eraser">
            <Eraser size={18} />
          </button>
          <div className="w-px h-6 bg-slate-800 mx-1"></div>
          {/* Colors */}
          <button onClick={() => setColor('#06b6d4')} className="w-6 h-6 rounded-full bg-cyan-500 ring-2 ring-transparent focus:ring-cyan-200" />
          <button onClick={() => setColor('#10b981')} className="w-6 h-6 rounded-full bg-emerald-500 ring-2 ring-transparent focus:ring-emerald-200" />
          <button onClick={() => setColor('#f59e0b')} className="w-6 h-6 rounded-full bg-amber-500 ring-2 ring-transparent focus:ring-amber-200" />
          <button onClick={() => setColor('#ef4444')} className="w-6 h-6 rounded-full bg-rose-500 ring-2 ring-transparent focus:ring-rose-200" />
          <div className="w-px h-6 bg-slate-800 mx-1"></div>
          <button onClick={clearCanvas} className="btn-secondary text-xs py-1.5 px-3">Clear</button>
        </div>
      </div>

      <div className="flex-1 relative rounded-xl border border-slate-800 bg-[#0b0f19] overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          className="w-full h-full cursor-crosshair"
        />
        
        {/* Simulated Remote Cursor (Bob) */}
        <div 
          className="absolute pointer-events-none z-10 transition-all duration-75 ease-linear"
          style={{ left: bobPos.x, top: bobPos.y }}
        >
          <MousePointer2 className="text-purple-500 fill-purple-500 drop-shadow-md" size={16} />
          <div className="bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-sm absolute left-3 top-3 whitespace-nowrap font-bold">
            Bob (Architect) {isBobDrawing ? '✏️' : ''}
          </div>
        </div>
      </div>
    </div>
  );
};
