import React, { useState, useEffect, useRef } from 'react';
import { Activity, GitMerge, Check, Loader2, FastForward, TerminalSquare } from 'lucide-react';

interface LogEntry {
  time: string;
  msg: string;
  type: 'info' | 'success' | 'warn' | 'error';
}

export const DevOpsHub: React.FC = () => {
  const [pipelineState, setPipelineState] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const [activeStep, setActiveStep] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([
    { time: '14:00:00', msg: 'Waiting for manual trigger or git push...', type: 'info' }
  ]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const steps = [
    { name: 'Lint & Code Quality', time: 1500 },
    { name: 'Unit Tests (Jest)', time: 2500 },
    { name: 'Build Production Asset', time: 3000 },
    { name: 'Deploy to Cloud Run', time: 2000 }
  ];

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const triggerPipeline = () => {
    if (pipelineState === 'running') return;
    
    setPipelineState('running');
    setActiveStep(0);
    setLogs([{ time: new Date().toLocaleTimeString(), msg: '🚀 Pipeline triggered manually by Alice.', type: 'info' }]);

    let currentStep = 0;
    
    const runStep = () => {
      if (currentStep >= steps.length) {
        setPipelineState('success');
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: '✅ Pipeline completed successfully. Deployed to production.', type: 'success' }]);
        return;
      }

      setActiveStep(currentStep);
      const stepInfo = steps[currentStep];
      
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: `Starting phase: ${stepInfo.name}...`, type: 'info' }]);

      setTimeout(() => {
        // Add some mock logs during the step
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: `[${stepInfo.name}] Processing assets...`, type: 'info' }]);
        
        if (currentStep === 1) {
          setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: `[Unit Tests] 412 passed, 0 failed.`, type: 'success' }]);
        }
        
        setTimeout(() => {
          setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: `[${stepInfo.name}] Completed successfully.`, type: 'success' }]);
          currentStep++;
          runStep();
        }, stepInfo.time / 2);

      }, stepInfo.time / 2);
    };

    runStep();
  };

  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="text-emerald-400" size={24} />
            DevOps Pipeline Hub
          </h2>
          <p className="text-sm text-slate-400">Phase 12: CI/CD Management & Build Monitoring</p>
        </div>
        <button 
          onClick={triggerPipeline}
          disabled={pipelineState === 'running'}
          className="btn-primary"
        >
          {pipelineState === 'running' ? <Loader2 size={16} className="animate-spin" /> : <FastForward size={16} />}
          Trigger Pipeline Run
        </button>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        
        {/* Pipeline Visualizer */}
        <div className="w-1/3 glass-panel border border-slate-800 rounded-xl bg-slate-950/50 p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          <h3 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
            <GitMerge size={18} className="text-purple-400" /> Release Pipeline
          </h3>
          
          <div className="flex flex-col gap-1 relative">
            {/* Connecting Line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-800 z-0"></div>

            {steps.map((step, idx) => {
              const isPast = pipelineState === 'success' || (pipelineState === 'running' && idx < activeStep);
              const isActive = pipelineState === 'running' && idx === activeStep;

              let statusColor = 'bg-slate-800 text-slate-500 border-slate-700';
              let icon = <div className="w-2 h-2 rounded-full bg-slate-500" />;

              if (isPast) {
                statusColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
                icon = <Check size={14} />;
              } else if (isActive) {
                statusColor = 'bg-cyan-500/20 text-cyan-400 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]';
                icon = <Loader2 size={14} className="animate-spin" />;
              }

              return (
                <div key={idx} className="relative z-10 flex items-center gap-4 p-3 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${statusColor} shrink-0 bg-slate-950`}>
                    {icon}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${isActive ? 'text-cyan-400' : isPast ? 'text-slate-200' : 'text-slate-500'}`}>
                      {step.name}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                      {isActive ? 'In Progress...' : isPast ? 'Completed' : 'Pending'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-slate-800">
            <div className="text-xs text-slate-400 flex justify-between mb-1">
              <span>Environment</span>
              <span className="text-slate-200 font-mono">Production</span>
            </div>
            <div className="text-xs text-slate-400 flex justify-between">
              <span>Last Deploy</span>
              <span className="text-emerald-400 font-mono">2 mins ago</span>
            </div>
          </div>
        </div>

        {/* Build Logs Terminal */}
        <div className="w-2/3 glass-panel border border-slate-800 rounded-xl overflow-hidden flex flex-col bg-[#05070e]">
          <div className="p-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 text-sm font-mono">
              <TerminalSquare size={16} className="text-cyan-400" /> Build Logs
            </div>
            <span className="text-xs text-slate-500 font-mono">Job #882</span>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-xs space-y-1.5" ref={logContainerRef}>
            {logs.map((log, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="text-slate-600 shrink-0">[{log.time}]</span>
                <span className={`
                  ${log.type === 'success' ? 'text-emerald-400' : ''}
                  ${log.type === 'warn' ? 'text-amber-400' : ''}
                  ${log.type === 'error' ? 'text-rose-400' : ''}
                  ${log.type === 'info' ? 'text-slate-300' : ''}
                `}>
                  {log.msg}
                </span>
              </div>
            ))}
            {pipelineState === 'running' && (
              <div className="flex gap-3 text-cyan-400/50">
                <span className="text-slate-600 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                <span className="animate-pulse">_</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
