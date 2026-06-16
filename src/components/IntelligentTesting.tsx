import { TestTube2, CheckCircle2, XCircle } from 'lucide-react';

export const IntelligentTesting = () => {
  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <TestTube2 className="text-emerald-400" size={24} />
          Intelligent Testing Framework
        </h2>
        <p className="text-sm text-slate-400">Phase 10: Auto Unit Tests & Coverage Analysis</p>
      </div>

      <div className="glass-panel p-6 border border-slate-800 rounded-xl bg-slate-950/50">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-24 h-24 rounded-full border-8 border-emerald-500 flex items-center justify-center text-xl font-bold text-emerald-400">
            94%
          </div>
          <div>
            <div className="text-lg font-bold text-slate-200">Global Test Coverage</div>
            <div className="text-sm text-slate-400">AI generated 142 missing branch tests this week.</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm bg-emerald-950/20 p-2 rounded border border-emerald-900/30">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span className="text-slate-300">auth_service.ts - 100% Coverage</span>
          </div>
          <div className="flex items-center gap-3 text-sm bg-rose-950/20 p-2 rounded border border-rose-900/30">
            <XCircle size={16} className="text-rose-400" />
            <span className="text-slate-300">payment_gateway.ts - 78% Coverage (Missing edge cases)</span>
            <button className="ml-auto btn-primary py-1 px-2 text-[10px]">Auto-Generate Tests</button>
          </div>
        </div>
      </div>
    </div>
  );
};
