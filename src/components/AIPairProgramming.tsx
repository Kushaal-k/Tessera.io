import { Headphones, Mic } from 'lucide-react';

export const AIPairProgramming = () => {
  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Headphones className="text-pink-400" size={24} />
          AI Pair Programming System
        </h2>
        <p className="text-sm text-slate-400">Phase 15: Live AI Collaboration & Audio Coaching</p>
      </div>

      <div className="glass-panel p-8 border border-slate-800 rounded-xl bg-slate-950/50 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-pink-500/20 border-4 border-pink-500/50 flex items-center justify-center mb-6 animate-pulse">
          <Mic className="text-pink-400" size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-200 mb-2">Voice Collaboration Active</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          The AI pair programmer is listening to your codebase context and voice commands. Say "Hey Tessera, refactor this component" to begin.
        </p>
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-900/50">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
          Context Memory Synchronized
        </div>
      </div>
    </div>
  );
};
