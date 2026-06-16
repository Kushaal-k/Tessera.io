import { Network, Zap, ArrowRight, Settings } from 'lucide-react';

export const KnowledgeGraphAdvanced = () => {
  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10 overflow-y-auto custom-scrollbar">
      {/* Header Banner */}
      <div className="mb-6 p-6 rounded-2xl glass-panel bg-slate-900/50 border border-amber-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-slate-800/50 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 shadow-lg">
            <Network className="text-amber-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Developer Knowledge Graph</h1>
            <p className="text-slate-400 text-sm mt-1">Build intelligence layer across repositories.</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-panel border border-slate-800/80 rounded-xl bg-slate-950/50 p-6 flex-1 min-h-[300px] flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-slate-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-4 relative z-10">
              <Zap className="text-amber-400 opacity-70 animate-pulse" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2 relative z-10">Advanced Simulation Engine</h3>
            <p className="text-sm text-slate-500 max-w-md relative z-10">
              This module operates continuously in the background, analyzing context and executing tasks autonomously.
            </p>
            <button className="mt-6 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-2 relative z-10">
              Initialize Subsystem <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Right Column / Telemetry */}
        <div className="flex flex-col gap-4">
          <div className="glass-panel border border-slate-800/80 rounded-xl bg-slate-950/50 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-300">System Telemetry</h3>
              <Settings size={14} className="text-slate-500 cursor-pointer hover:text-slate-300" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Metric Node 0{i}</span>
                    <span className="text-slate-300">{(Math.random() * 40 + 60).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div className={`bg-gradient-to-r from-slate-700 to-amber-500 h-1.5 rounded-full`} style={{ width: `${Math.random() * 60 + 40}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel border border-slate-800/80 rounded-xl bg-slate-950/50 p-5 flex-1 flex flex-col justify-center items-center text-center">
             <div className="w-12 h-12 rounded-full border border-dashed border-slate-700 flex items-center justify-center mb-3">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
             </div>
             <p className="text-xs text-slate-400 font-mono">Phase 30 Online</p>
          </div>
        </div>
      </div>
    </div>
  );
};
