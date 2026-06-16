import { Cloud, Cpu, Database, HardDrive } from 'lucide-react';

export const CloudEnvironment = () => {
  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Cloud className="text-sky-400" size={24} />
          Cloud Development Environment
        </h2>
        <p className="text-sm text-slate-400">Phase 14: Remote Containers & Persistent Workspaces</p>
      </div>

      <div className="glass-panel p-6 border border-slate-800 rounded-xl bg-slate-950/50">
        <h3 className="font-semibold text-slate-200 mb-6 border-b border-slate-800 pb-2">Container Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border-8 border-slate-800 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-8 border-sky-500/50" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}></div>
              <Cpu className="text-sky-400 mb-2" size={24} />
              <div className="absolute bottom-6 font-bold text-slate-200">2.4 vCPU</div>
            </div>
            <span className="mt-4 text-sm font-medium text-slate-400">Compute</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border-8 border-slate-800 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-8 border-purple-500/50" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}></div>
              <Database className="text-purple-400 mb-2" size={24} />
              <div className="absolute bottom-6 font-bold text-slate-200">8 GB</div>
            </div>
            <span className="mt-4 text-sm font-medium text-slate-400">Memory</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border-8 border-slate-800 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-8 border-emerald-500/50" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}></div>
              <HardDrive className="text-emerald-400 mb-2" size={24} />
              <div className="absolute bottom-6 font-bold text-slate-200">12 GB</div>
            </div>
            <span className="mt-4 text-sm font-medium text-slate-400">Storage</span>
          </div>
        </div>
      </div>
    </div>
  );
};
