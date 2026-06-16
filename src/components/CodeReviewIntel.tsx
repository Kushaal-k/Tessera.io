import { Eye, ShieldAlert, ThumbsUp } from 'lucide-react';

export const CodeReviewIntel = () => {
  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Eye className="text-indigo-400" size={24} />
          Code Review Intelligence
        </h2>
        <p className="text-sm text-slate-400">Phase 11: AI Review Assistant & Maintainability Analysis</p>
      </div>

      <div className="glass-panel p-6 border border-slate-800 rounded-xl bg-slate-950/50">
        <h3 className="font-semibold text-slate-200 mb-4">PR #442: Feature/Stripe-Integration</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2">
              <ShieldAlert size={16} /> Security Warning
            </div>
            <p className="text-sm text-slate-300">
              Line 42 contains a hardcoded API key structure. Consider moving `pk_live_...` to environment variables to prevent accidental credential leakage.
            </p>
          </div>
          
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
              <ThumbsUp size={16} /> Architecture Approval
            </div>
            <p className="text-sm text-slate-300">
              Great use of the repository pattern here. This cleanly abstracts the payment provider logic from the business controllers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
