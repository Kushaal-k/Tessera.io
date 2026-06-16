import { BarChart3, PieChart } from 'lucide-react';

export const DeveloperAnalytics = () => {
  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="text-cyan-400" size={24} />
          Developer Analytics Platform
        </h2>
        <p className="text-sm text-slate-400">Phase 13: Team Insights & Contribution Metrics</p>
      </div>
      <div className="glass-panel p-8 border border-slate-800 rounded-xl bg-slate-950/50 text-center">
        <PieChart size={48} className="text-cyan-400 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-bold text-slate-200">Organization Analytics Dashboard</h3>
        <p className="text-sm text-slate-400 mt-2">Aggregate view of cross-team productivity, PR turnaround times, and Code Churn metrics.</p>
      </div>
    </div>
  );
};
