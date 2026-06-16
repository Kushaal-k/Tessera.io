import { GitBranch, GitPullRequest, GitCommit } from 'lucide-react';

export const GitHubIntegration = () => {
  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <GitBranch className="text-cyan-400" size={24} />
          GitHub Integration Platform
        </h2>
        <p className="text-sm text-slate-400">Phase 4: Seamless Repository & PR Synchronization</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 border border-slate-800 rounded-xl bg-slate-950/50">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <GitPullRequest size={18} className="text-purple-400" /> Active Pull Requests
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-200 font-medium">feat: AI Code Review integration</div>
                  <div className="text-xs text-slate-500">#412 opened 2 hours ago by Alice</div>
                </div>
                <span className="badge badge-cyan text-[10px]">Review Required</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 border border-slate-800 rounded-xl bg-slate-950/50">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <GitCommit size={18} className="text-emerald-400" /> Recent Commits
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-px bg-slate-800 mt-2"></div>
              <div>
                <div className="text-sm text-slate-300">Updated WebRTC configuration for Whiteboard</div>
                <div className="text-xs text-slate-500 font-mono">fc82a1d • Bob</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-px bg-slate-800 mt-2"></div>
              <div>
                <div className="text-sm text-slate-300">Fix synchronization race condition in Yjs</div>
                <div className="text-xs text-slate-500 font-mono">9a2b4c1 • Alice</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
