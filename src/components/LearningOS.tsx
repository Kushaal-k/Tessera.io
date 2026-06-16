import { GraduationCap, Target } from 'lucide-react';

export const LearningOS = () => {
  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <GraduationCap className="text-pink-400" size={24} />
          AI Learning Operating System
        </h2>
        <p className="text-sm text-slate-400">Phase 21: Personalized Roadmaps & Project-Based Learning</p>
      </div>
      <div className="glass-panel p-8 border border-slate-800 rounded-xl bg-slate-950/50 text-center">
        <Target size={48} className="text-pink-400 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-bold text-slate-200">Your Learning Roadmap: Advanced Web3</h3>
        <p className="text-sm text-slate-400 mt-2">Next milestone: Build a distributed ledger consensus module.</p>
      </div>
    </div>
  );
};
