import { ShoppingBag, DownloadCloud } from 'lucide-react';

export const DevMarketplace = () => {
  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <ShoppingBag className="text-amber-400" size={24} />
          Developer Marketplace
        </h2>
        <p className="text-sm text-slate-400">Phase 20: Plugins, AI Extensions & Workspaces</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 border border-slate-800 rounded-xl bg-slate-950/50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-200">Rust Macro Generator AI</h3>
            <p className="text-xs text-slate-400 mt-1">Official Tessera Extension</p>
          </div>
          <button className="btn-secondary py-1 px-3 text-xs"><DownloadCloud size={14}/> Install</button>
        </div>
      </div>
    </div>
  );
};
