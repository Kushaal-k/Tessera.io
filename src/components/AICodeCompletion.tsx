import { Wand2, Zap } from 'lucide-react';

export const AICodeCompletion = () => {
  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Wand2 className="text-cyan-400" size={24} />
          AI Code Completion Engine
        </h2>
        <p className="text-sm text-slate-400">Phase 6: Context Aware Suggestions & Bug Prediction</p>
      </div>

      <div className="glass-panel border border-slate-800 rounded-xl bg-[#0d1117] overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2 bg-[#161b22]">
          <span className="text-slate-300 font-mono text-sm">user_service.ts</span>
        </div>
        <div className="p-6 font-mono text-sm leading-relaxed relative">
          <div className="text-slate-400">function calculateRiskScore(user) {'{'}</div>
          <div className="text-slate-400 pl-4">let score = 0;</div>
          <div className="text-slate-400 pl-4">if (user.age &lt; 18) score += 5;</div>
          <div className="text-slate-100 pl-4 relative inline-block">
            if (user.balance &lt; 0)
            <span className="absolute top-full left-0 mt-1 bg-cyan-900/50 border border-cyan-500/50 text-cyan-300 px-2 py-1 rounded text-xs animate-pulse whitespace-nowrap">
              <Zap size={10} className="inline mr-1"/> Suggestion: return handleNegativeBalance(user);
            </span>
          </div>
          <br/><br/>
          <div className="text-slate-400">{'}'}</div>
        </div>
      </div>
    </div>
  );
};
