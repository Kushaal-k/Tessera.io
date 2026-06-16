import { Globe, GitMerge } from 'lucide-react';

export const GlobalNetwork = () => {
  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Globe className="text-blue-400" size={24} />
          Global Collaboration Network
        </h2>
        <p className="text-sm text-slate-400">Phase 24: Cross-Organization Workspaces & Federated Dev</p>
      </div>
      <div className="glass-panel p-8 border border-slate-800 rounded-xl bg-slate-950/50 text-center">
        <GitMerge size={48} className="text-blue-400 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-bold text-slate-200">Federated Workspace Sync</h3>
        <p className="text-sm text-slate-400 mt-2">Connected to global nodes in London, Tokyo, and San Francisco.</p>
      </div>
    </div>
  );
};
