import { Rocket, ShieldCheck, Zap } from 'lucide-react';

export const TesseraOSHub = () => {
  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Rocket className="text-emerald-400" size={24} />
          Tessera Developer OS Capstone
        </h2>
        <p className="text-sm text-slate-400">Phase 25: The Unified AI Development Ecosystem</p>
      </div>

      <div className="glass-panel p-10 border border-slate-800 rounded-xl bg-gradient-to-br from-slate-950 to-indigo-950 text-center">
        <div className="inline-block p-4 rounded-full bg-slate-900 border border-slate-800 shadow-2xl shadow-indigo-500/20 mb-6">
          <Zap size={64} className="text-cyan-400" />
        </div>
        <h3 className="text-2xl font-bold text-slate-100 mb-4">All Systems Operational</h3>
        <p className="text-slate-400 max-w-lg mx-auto mb-8">
          Welcome to the final phase of the Tessera Developer Operating System. You now have access to a unified ecosystem that integrates real-time collaboration, autonomous AI engineering workflows, global network sharing, and enterprise-grade security.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
            <ShieldCheck className="text-emerald-400 mb-2" size={24} />
            <h4 className="font-bold text-slate-200">Zero-Trust Secured</h4>
            <p className="text-xs text-slate-400 mt-1">Workspaces are isolated and end-to-end encrypted.</p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
            <Rocket className="text-purple-400 mb-2" size={24} />
            <h4 className="font-bold text-slate-200">Autonomous Ready</h4>
            <p className="text-xs text-slate-400 mt-1">Multi-agent orchestrators are actively awaiting commands.</p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
            <Zap className="text-cyan-400 mb-2" size={24} />
            <h4 className="font-bold text-slate-200">Hyper-Optimized</h4>
            <p className="text-xs text-slate-400 mt-1">Real-time collaboration synced at &lt;50ms latency.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
