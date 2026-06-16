import { LayoutDashboard, Users, Server, Plus } from 'lucide-react';

export const WorkspaceManager = () => {
  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <LayoutDashboard className="text-purple-400" size={24} />
            Workspace Management
          </h2>
          <p className="text-sm text-slate-400">Phase 7: Project Scopes & Environment Orchestration</p>
        </div>
        <button className="btn-primary py-1.5 px-3 text-xs"><Plus size={14}/> New Workspace</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Tessera.io Engine', 'Marketing Site', 'Data Pipeline'].map((ws, i) => (
          <div key={i} className="glass-panel p-5 border border-slate-800 rounded-xl bg-slate-950/50 hover:border-purple-500/50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-purple-500/30">
                <Server size={20} className="text-purple-400" />
              </div>
              <span className="badge badge-emerald">Active</span>
            </div>
            <h3 className="font-bold text-slate-100 mb-1">{ws}</h3>
            <p className="text-xs text-slate-500 mb-4">Node.js • React • TS</p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Users size={14} /> 4 Collaborators
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
