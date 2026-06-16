import { Code2, Zap, BrainCircuit, Bot, Activity, Hexagon, Factory, ShieldCheck } from 'lucide-react';

export const DashboardOverview = ({ onNavigate }: { onNavigate: (view: string) => void }) => {
  const roadmapPhases = [
    { num: 1, title: 'Real-Time IDE', active: true, view: 'ide' },
    { num: 2, title: 'Socratic Mentor', active: true, view: 'mentor' },
    { num: 3, title: 'WebRTC Whiteboard', active: true, view: 'whiteboard' },
    { num: 4, title: 'GitHub Integration', active: true, view: 'github' },
    { num: 5, title: 'Sandbox Expansion', active: true, view: 'ide' },
    { num: 6, title: 'AI Code Completion', active: true, view: 'code-completion' },
    { num: 7, title: 'Workspace Manager', active: true, view: 'workspace' },
    { num: 8, title: 'Knowledge Graph', active: true, view: 'graph' },
    { num: 9, title: 'AI Documentation', active: true, view: 'documentation' },
    { num: 10, title: 'Intelligent Testing', active: true, view: 'testing' },
    { num: 11, title: 'Code Review Intel', active: true, view: 'review' },
    { num: 12, title: 'DevOps Pipeline', active: true, view: 'devops' },
    { num: 13, title: 'Developer Analytics', active: true, view: 'analytics' },
    { num: 14, title: 'Cloud Environment', active: true, view: 'cloud' },
    { num: 15, title: 'Pair Programming', active: true, view: 'pair-programming' },
    { num: 16, title: 'Enterprise Security', active: true, view: 'security' },
    { num: 17, title: 'Multi-Agent System', active: true, view: 'agents' },
    { num: 18, title: 'Architecture Studio', active: true, view: 'architecture' },
    { num: 19, title: 'Open Source Hub', active: true, view: 'open-source' },
    { num: 20, title: 'Dev Marketplace', active: true, view: 'marketplace' },
    { num: 21, title: 'Learning OS', active: true, view: 'learning' },
    { num: 22, title: 'Software Factory', active: true, view: 'factory' },
    { num: 23, title: 'Digital Twin', active: true, view: 'twin' },
    { num: 24, title: 'Global Network', active: true, view: 'network' },
    { num: 25, title: 'Tessera OS Hub', active: true, view: 'tessera-hub' },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10 overflow-y-auto custom-scrollbar">
      
      {/* Welcome Banner */}
      <div className="mb-6 p-6 rounded-2xl glass-panel bg-gradient-to-r from-cyan-900/40 to-purple-900/40 border border-slate-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back, Alice</h1>
          <p className="text-slate-300 max-w-2xl">
            Tessera.io OS is actively managing 3 collaborative workspaces. Your Socratic Mentor has 2 new learning modules ready.
          </p>
          <div className="mt-4 flex gap-3">
            <button onClick={() => onNavigate('ide')} className="btn-primary"><Code2 size={16} /> Resume Coding</button>
            <button onClick={() => onNavigate('agents')} className="btn-secondary"><Bot size={16} /> Orchestrate Agents</button>
            <button onClick={() => onNavigate('tessera-hub')} className="btn-secondary border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"><ShieldCheck size={16} /> View OS Capstone</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Telemetry Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="glass-panel p-5 border border-slate-800/80 rounded-xl bg-slate-950/50 flex flex-col justify-between cursor-pointer hover:border-cyan-500/50 transition-colors" onClick={() => onNavigate('devops')}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium">Pipeline Velocity</p>
                <h3 className="text-2xl font-bold text-slate-100 mt-1">94%</h3>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><Activity size={20} /></div>
            </div>
            <div className="mt-4 text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <Zap size={10} /> +12% from last sprint
            </div>
          </div>

          <div className="glass-panel p-5 border border-slate-800/80 rounded-xl bg-slate-950/50 flex flex-col justify-between cursor-pointer hover:border-purple-500/50 transition-colors" onClick={() => onNavigate('twin')}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium">AI Collaboration</p>
                <h3 className="text-2xl font-bold text-slate-100 mt-1">Top 4%</h3>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400"><BrainCircuit size={20} /></div>
            </div>
            <div className="mt-4 text-[10px] text-purple-400 font-medium flex items-center gap-1">
              Level 7 Prompt Engineer
            </div>
          </div>
          
          <div className="glass-panel p-5 border border-slate-800/80 rounded-xl bg-slate-950/50 flex flex-col justify-between cursor-pointer hover:border-amber-500/50 transition-colors" onClick={() => onNavigate('workspace')}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium">Active Environments</p>
                <h3 className="text-2xl font-bold text-slate-100 mt-1">3</h3>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400"><Hexagon size={20} /></div>
            </div>
            <div className="mt-4 text-[10px] text-amber-400 font-medium">
              2 Cloud, 1 Local Sandbox
            </div>
          </div>

          <div className="glass-panel p-5 border border-slate-800/80 rounded-xl bg-slate-950/50 flex flex-col justify-between cursor-pointer hover:border-orange-500/50 transition-colors" onClick={() => onNavigate('factory')}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium">Autonomous Factory</p>
                <h3 className="text-2xl font-bold text-slate-100 mt-1">Running</h3>
              </div>
              <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400"><Factory size={20} /></div>
            </div>
            <div className="mt-4 text-[10px] text-orange-400 font-medium">
              Generating "User Onboarding" Epic
            </div>
          </div>
        </div>

        {/* Phase Explorer */}
        <div className="glass-panel border border-slate-800/80 rounded-xl bg-slate-950/50 flex flex-col h-80">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-bold text-slate-200">OS Phase Explorer</h3>
            <p className="text-xs text-slate-500">1-25 Roadmap Tracking</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {roadmapPhases.map((phase) => (
              <div 
                key={phase.num} 
                className="flex items-center gap-3 p-2 hover:bg-slate-800/50 rounded-lg group cursor-pointer transition-colors"
                onClick={() => onNavigate(phase.view)}
              >
                <div className="w-6 h-6 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] text-slate-400 font-mono group-hover:border-cyan-500 group-hover:text-cyan-400 transition-colors">
                  {phase.num}
                </div>
                <div className="flex-1 text-sm text-slate-300 group-hover:text-white transition-colors">
                  {phase.title}
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
