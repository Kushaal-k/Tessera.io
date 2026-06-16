import { Shield, Key, FileWarning, Eye } from 'lucide-react';

export const EnterpriseSecurity = () => {
  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Shield className="text-rose-400" size={24} />
          Enterprise Security Framework
        </h2>
        <p className="text-sm text-slate-400">Phase 16: RBAC, Audit Logging & Workspace Isolation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 border border-slate-800 rounded-xl bg-slate-950/50">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Key size={18} className="text-amber-400" /> Active Secrets (Isolated)
          </h3>
          <div className="space-y-2">
            {['AWS_ACCESS_KEY', 'DATABASE_URL', 'STRIPE_SECRET'].map((secret, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-900 rounded border border-slate-800 font-mono text-xs">
                <span className="text-amber-400">{secret}</span>
                <span className="text-slate-500">********************</span>
                <Eye size={14} className="text-slate-600 hover:text-slate-400 cursor-pointer" />
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 border border-slate-800 rounded-xl bg-slate-950/50">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <FileWarning size={18} className="text-rose-400" /> Security Audit Log
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex gap-3 text-slate-300">
              <span className="text-slate-500">14:02:11</span>
              <span>Alice modified RBAC policy for group 'Contractors'</span>
            </div>
            <div className="flex gap-3 text-rose-400">
              <span className="text-slate-500">13:45:00</span>
              <span>Failed auth attempt from anomalous IP address</span>
            </div>
            <div className="flex gap-3 text-slate-300">
              <span className="text-slate-500">11:20:33</span>
              <span>Workspace #42 sandbox isolated via gVisor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
