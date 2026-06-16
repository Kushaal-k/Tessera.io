import { Factory, Cog } from 'lucide-react';

export const SoftwareFactory = () => {
  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Factory className="text-orange-400" size={24} />
          Autonomous Software Factory
        </h2>
        <p className="text-sm text-slate-400">Phase 22: Requirement Analysis to Deployment</p>
      </div>
      <div className="glass-panel p-6 border border-slate-800 rounded-xl bg-slate-950/50">
        <div className="flex items-center gap-4 text-orange-400 animate-pulse mb-4">
          <Cog size={24} className="animate-spin" />
          <h3 className="font-semibold text-slate-200">Factory Assembly Line #04 Running</h3>
        </div>
        <p className="text-sm text-slate-400 mb-6">Converting Jira Epic "User Onboarding Flow" into modular React components and backend routes.</p>
        <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
          <div className="h-full bg-orange-500 rounded-full w-[45%]"></div>
        </div>
      </div>
    </div>
  );
};
