import { Globe2, Heart } from 'lucide-react';

export const OpenSourceHub = () => {
  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Globe2 className="text-emerald-400" size={24} />
          Open Source Contribution Hub
        </h2>
        <p className="text-sm text-slate-400">Phase 19: Issue Discovery & Mentorship</p>
      </div>
      <div className="glass-panel p-6 border border-slate-800 rounded-xl bg-slate-950/50">
        <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Heart size={18} className="text-rose-400" /> Recommended Issues for You
        </h3>
        <div className="space-y-3">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded text-sm text-slate-300">
            <span className="text-emerald-400 font-bold">facebook/react</span> - #28441: Fix suspense boundary hydration mismatch
            <div className="text-xs text-slate-500 mt-1">Matched based on your React Architecture skill level.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
