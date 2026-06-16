import React, { useState } from 'react';
import { Network, Database, Layout, Server, Lock, Zap } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  type: 'frontend' | 'backend' | 'database' | 'auth';
  x: number;
  y: number;
  connections: string[];
}

const KNOWLEDGE_GRAPH_DATA: Node[] = [
  { id: 'app', label: 'App.tsx (Frontend Core)', type: 'frontend', x: 20, y: 30, connections: ['auth', 'api'] },
  { id: 'auth', label: 'AuthService (OAuth)', type: 'auth', x: 50, y: 15, connections: ['db'] },
  { id: 'api', label: 'Backend API Gateway', type: 'backend', x: 50, y: 50, connections: ['db', 'worker'] },
  { id: 'db', label: 'Primary Database (PostgreSQL)', type: 'database', x: 80, y: 30, connections: [] },
  { id: 'worker', label: 'Async Worker (Redis)', type: 'backend', x: 80, y: 70, connections: ['db'] },
];

export const KnowledgeGraph: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const getNodeColor = (type: string) => {
    switch(type) {
      case 'frontend': return 'bg-cyan-500/20 border-cyan-500 text-cyan-400';
      case 'backend': return 'bg-purple-500/20 border-purple-500 text-purple-400';
      case 'database': return 'bg-emerald-500/20 border-emerald-500 text-emerald-400';
      case 'auth': return 'bg-amber-500/20 border-amber-500 text-amber-400';
      default: return 'bg-slate-500/20 border-slate-500 text-slate-400';
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'frontend': return <Layout size={16} />;
      case 'backend': return <Server size={16} />;
      case 'database': return <Database size={16} />;
      case 'auth': return <Lock size={16} />;
      default: return <Network size={16} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Network className="text-emerald-400" size={24} />
          Developer Knowledge Graph
        </h2>
        <p className="text-sm text-slate-400">Phase 8: Code Relationship Mapping & Architecture Discovery</p>
      </div>

      <div className="flex-1 glass-panel relative overflow-hidden bg-slate-950/80 rounded-xl border border-slate-800">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        {/* Static SVG for edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {KNOWLEDGE_GRAPH_DATA.map(node => (
            node.connections.map(targetId => {
              const targetNode = KNOWLEDGE_GRAPH_DATA.find(n => n.id === targetId);
              if (!targetNode) return null;
              
              const isHighlighted = hoveredNode === node.id || hoveredNode === targetId;

              return (
                <line 
                  key={`${node.id}-${targetId}`}
                  x1={`${node.x}%`} 
                  y1={`${node.y}%`} 
                  x2={`${targetNode.x}%`} 
                  y2={`${targetNode.y}%`} 
                  stroke={isHighlighted ? '#a855f7' : '#334155'}
                  strokeWidth={isHighlighted ? 3 : 2}
                  className="transition-all duration-300"
                  strokeDasharray={isHighlighted ? "5,5" : "none"}
                />
              );
            })
          ))}
        </svg>

        {/* Nodes */}
        {KNOWLEDGE_GRAPH_DATA.map(node => (
          <div
            key={node.id}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-3 rounded-lg border backdrop-blur-md cursor-pointer transition-all duration-300 shadow-xl ${getNodeColor(node.type)} ${hoveredNode === node.id ? 'scale-110 z-20 shadow-purple-500/20' : 'hover:scale-105 z-10'}`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <div className="flex items-center gap-2 mb-1">
              {getIcon(node.type)}
              <span className="font-bold text-sm tracking-wide">{node.id.toUpperCase()}</span>
            </div>
            <div className="text-xs text-slate-300 max-w-[120px] whitespace-normal break-words">
              {node.label}
            </div>
            {hoveredNode === node.id && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 p-2 bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-300 shadow-2xl z-30 pointer-events-none">
                <div className="flex items-center gap-1 text-emerald-400 mb-1 font-semibold">
                  <Zap size={10} /> Dependency AI Insight
                </div>
                Modifying this module impacts {node.connections.length} downstream dependencies. Tests cover 92% of branches.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
