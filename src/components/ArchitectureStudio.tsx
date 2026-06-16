import { Hexagon, Layers } from 'lucide-react';

export const ArchitectureStudio = () => {
  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Hexagon className="text-purple-400" size={24} />
          AI Architecture Studio
        </h2>
        <p className="text-sm text-slate-400">Phase 18: System Design & Architecture Generation</p>
      </div>
      <div className="glass-panel p-8 border border-slate-800 rounded-xl bg-slate-950/50 flex items-center justify-center h-64 text-center">
        <div>
          <Layers size={48} className="text-purple-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-slate-200">Architecture Canvas Active</h3>
          <p className="text-sm text-slate-400 max-w-sm mt-2">Use the prompt bar below to generate cloud architectures. Example: "Design a serverless ingestion pipeline on AWS."</p>
        </div>
      </div>
    </div>
  );
};
