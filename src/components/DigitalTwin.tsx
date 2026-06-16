import React from 'react';
import { User, TrendingUp, Cpu, Award, Zap, Crosshair } from 'lucide-react';

export const DigitalTwin: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10 overflow-y-auto custom-scrollbar">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <User className="text-cyan-400" size={24} />
          Developer Digital Twin
        </h2>
        <p className="text-sm text-slate-400">Phase 23: Skill Modeling, Productivity Simulation, and Career Analytics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Profile Summary */}
        <div className="glass-panel p-6 border border-slate-800 rounded-xl bg-slate-950/50 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 p-1 mb-4">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-4 border-slate-900">
              <User size={40} className="text-cyan-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-100">Alice (Dev Lead)</h3>
          <p className="text-sm text-cyan-400 font-semibold mb-4">Senior AI-Collaborator</p>
          
          <div className="w-full space-y-3 mt-4">
            <div className="flex justify-between text-xs border-b border-slate-800 pb-2">
              <span className="text-slate-400">Global Rank</span>
              <span className="text-slate-200 font-bold">Top 4%</span>
            </div>
            <div className="flex justify-between text-xs border-b border-slate-800 pb-2">
              <span className="text-slate-400">Lines Autocoded</span>
              <span className="text-emerald-400 font-bold">142,050</span>
            </div>
            <div className="flex justify-between text-xs border-b border-slate-800 pb-2">
              <span className="text-slate-400">Socratic Score</span>
              <span className="text-purple-400 font-bold">980 XP</span>
            </div>
          </div>
        </div>

        {/* Skill Matrix */}
        <div className="glass-panel p-6 border border-slate-800 rounded-xl bg-slate-950/50 lg:col-span-2">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Crosshair size={18} className="text-emerald-400" /> Competency Matrix
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>React Architecture</span> <span className="text-cyan-400">Level 9 (Expert)</span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full"><div className="h-full bg-cyan-500 rounded-full w-[90%]"></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>AI Prompt Engineering</span> <span className="text-purple-400">Level 7 (Advanced)</span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full"><div className="h-full bg-purple-500 rounded-full w-[75%]"></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Distributed Systems</span> <span className="text-emerald-400">Level 6 (Proficient)</span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full"><div className="h-full bg-emerald-500 rounded-full w-[60%]"></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Security & Cryptography</span> <span className="text-amber-400">Level 5 (Intermediate)</span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full"><div className="h-full bg-amber-500 rounded-full w-[50%]"></div></div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
            <div className="text-xs text-slate-400 mb-2">Learning Forecast (Next 30 Days)</div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Based on your interaction with the <span className="text-cyan-400 font-semibold">Socratic Mentor</span> and recent pull requests, our models predict you will reach <span className="text-emerald-400 font-semibold">Level 7 in Distributed Systems</span> by next week. We recommend focusing on Redis caching patterns.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Simulation */}
        <div className="glass-panel p-6 border border-slate-800 rounded-xl bg-slate-950/50">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-cyan-400" /> Velocity Simulation
          </h3>
          <div className="h-48 flex items-end justify-between gap-2 border-b border-slate-800 pb-2 relative">
            {/* Fake graph bars */}
            {[40, 60, 45, 80, 55, 90, 75, 100, 85, 95].map((height, i) => (
              <div key={i} className="w-full relative group">
                <div 
                  className="bg-cyan-500/20 border border-cyan-500/50 rounded-t w-full transition-all duration-500 hover:bg-cyan-400/40"
                  style={{ height: `${height}%` }}
                ></div>
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-[10px] text-cyan-300 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-slate-700">
                  Sprint {i+1}: {height} pts
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-2">
            <span>Sprint 1</span>
            <span>Current (Sprint 10)</span>
          </div>
        </div>

        {/* Career Analytics */}
        <div className="glass-panel p-6 border border-slate-800 rounded-xl bg-slate-950/50">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Award size={18} className="text-amber-400" /> Career Trajectory
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-slate-900 p-2 rounded text-emerald-400 border border-slate-800"><Cpu size={16} /></div>
              <div>
                <div className="text-sm font-semibold text-slate-200">AI-Native Principal Engineer</div>
                <div className="text-xs text-slate-400">Match: 92% • Projected timeline: 8 months</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-slate-900 p-2 rounded text-cyan-400 border border-slate-800"><Zap size={16} /></div>
              <div>
                <div className="text-sm font-semibold text-slate-200">Autonomous Systems Architect</div>
                <div className="text-xs text-slate-400">Match: 78% • Needs stronger Distributed Systems</div>
              </div>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-200 mt-2">
              <strong>Tip:</strong> Join the "Global Innovation Lab" workspace to collaborate on Open Source projects and boost your Architecture skills.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
