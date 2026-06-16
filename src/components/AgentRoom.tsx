import React, { useState, useEffect, useRef } from 'react';
import { Bot, Play, CheckCircle2, Code2, Cpu, ShieldCheck } from 'lucide-react';

interface AgentMessage {
  agent: string;
  role: string;
  color: string;
  text: string;
  icon: React.ReactNode;
}

export const AgentRoom: React.FC = () => {
  const [taskInput, setTaskInput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [outputCode, setOutputCode] = useState('// Waiting for autonomous agents to generate code...');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const runAgentSimulation = () => {
    if (!taskInput.trim() || isSimulating) return;
    
    setIsSimulating(true);
    setMessages([]);
    setOutputCode('// Agents are initializing workspace...\n');
    
    const steps = [
      {
        delay: 500,
        msg: {
          agent: 'Architect-AI', role: 'System Design', color: 'cyan', icon: <Cpu size={16} />,
          text: `Analyzing requirement: "${taskInput}". Proposing a RESTful endpoint using Express.js with input validation.`
        }
      },
      {
        delay: 2000,
        msg: {
          agent: 'Coder-AI', role: 'Implementation', color: 'emerald', icon: <Code2 size={16} />,
          text: `Agreed. Writing the route handler and integrating Zod for schema validation.`
        },
        codeUpdate: `import express from 'express';\nimport { z } from 'zod';\n\nconst app = express();\napp.use(express.json());\n\n// Draft initialized.\n`
      },
      {
        delay: 4000,
        msg: {
          agent: 'QA-Review-AI', role: 'Security & Quality', color: 'amber', icon: <ShieldCheck size={16} />,
          text: `Reviewing code. Missing rate limiting and error handling middleware. Please add them to prevent DoS attacks.`
        }
      },
      {
        delay: 6000,
        msg: {
          agent: 'Coder-AI', role: 'Implementation', color: 'emerald', icon: <Code2 size={16} />,
          text: `Good catch. Implementing express-rate-limit and a global error handler.`
        },
        codeUpdate: `import express from 'express';\nimport rateLimit from 'express-rate-limit';\nimport { z } from 'zod';\n\nconst app = express();\napp.use(express.json());\n\nconst limiter = rateLimit({\n  windowMs: 15 * 60 * 1000,\n  max: 100\n});\napp.use(limiter);\n\napp.post('/api/resource', (req, res) => {\n  // Implementation\n  res.json({ success: true });\n});\n\napp.use((err, req, res, next) => {\n  res.status(500).json({ error: 'Internal Server Error' });\n});\n`
      },
      {
        delay: 8000,
        msg: {
          agent: 'Architect-AI', role: 'System Design', color: 'cyan', icon: <Cpu size={16} />,
          text: `Architecture verified. Code meets enterprise standards. Pipeline ready for PR.`
        }
      }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setMessages(prev => [...prev, step.msg]);
        if (step.codeUpdate) {
          setOutputCode(step.codeUpdate);
        }
        if (index === steps.length - 1) {
          setIsSimulating(false);
          setTaskInput('');
        }
      }, step.delay);
    });
  };

  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Bot className="text-cyan-400" size={24} />
          Multi-Agent Development System
        </h2>
        <p className="text-sm text-slate-400">Phase 17: Autonomous Engineering Workflows</p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        
        {/* Left: Agent Chat & Orchestration */}
        <div className="w-1/2 flex flex-col glass-panel border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <span className="font-semibold text-sm">Agent Orchestration Hub</span>
            {isSimulating && <span className="badge badge-cyan animate-pulse">Simulation Active</span>}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
            {messages.length === 0 && !isSimulating && (
              <div className="text-slate-500 text-sm italic text-center mt-10">
                Awaiting task assignment. Agents are idle.
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${msg.color}-500/20 text-${msg.color}-400 shrink-0 mt-1 border border-${msg.color}-500/30`}>
                  {msg.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold text-${msg.color}-400`}>{msg.agent}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{msg.role}</span>
                  </div>
                  <div className="text-sm text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {isSimulating && messages.length < 5 && (
              <div className="flex items-center gap-2 text-slate-500 text-xs italic pl-11">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                Agent typing...
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-950">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Assign a coding task to the agent swarm..."
                disabled={isSimulating}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
                onKeyDown={(e) => { if (e.key === 'Enter') runAgentSimulation(); }}
              />
              <button 
                onClick={runAgentSimulation}
                disabled={!taskInput.trim() || isSimulating}
                className="btn-primary"
              >
                <Play size={16} /> Deploy Agents
              </button>
            </div>
          </div>
        </div>

        {/* Right: Output Artifact */}
        <div className="w-1/2 flex flex-col glass-panel border border-slate-800 rounded-xl overflow-hidden bg-[#0d1117]">
          <div className="p-3 border-b border-slate-800 bg-[#161b22] flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Code2 size={16} className="text-emerald-400" /> generated_endpoint.ts
            </div>
            {messages.length === 5 && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={14} /> Ready for Review
              </span>
            )}
          </div>
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-sm text-slate-300 whitespace-pre">
            {outputCode}
          </div>
        </div>

      </div>
    </div>
  );
};
