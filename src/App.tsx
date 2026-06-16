import { useState } from 'react';
import { 
  LayoutDashboard, Terminal, BrainCircuit, Share2, Network, Bot, 
  Activity, UserCircle, GitBranch, Server, Cloud, Shield, Wand2, FileText, 
  TestTube2, Eye, Headphones, Hexagon, Factory, BarChart3, Globe2, ShoppingBag, 
  GraduationCap, Globe, Rocket
} from 'lucide-react';

// Core
import { DashboardOverview } from './components/DashboardOverview';
import { IDEWorkspace } from './components/IDEWorkspace';
import { SocraticMentor } from './components/SocraticMentor';
import { Whiteboard } from './components/Whiteboard';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { AgentRoom } from './components/AgentRoom';
import { DevOpsHub } from './components/DevOpsHub';
import { DigitalTwin } from './components/DigitalTwin';

// New Integrations & Environments
import { GitHubIntegration } from './components/GitHubIntegration';
import { WorkspaceManager } from './components/WorkspaceManager';
import { CloudEnvironment } from './components/CloudEnvironment';
import { EnterpriseSecurity } from './components/EnterpriseSecurity';

// New Intelligence Layer
import { AICodeCompletion } from './components/AICodeCompletion';
import { AIDocumentation } from './components/AIDocumentation';
import { IntelligentTesting } from './components/IntelligentTesting';
import { CodeReviewIntel } from './components/CodeReviewIntel';
import { AIPairProgramming } from './components/AIPairProgramming';

// New Studios & Factories
import { ArchitectureStudio } from './components/ArchitectureStudio';
import { SoftwareFactory } from './components/SoftwareFactory';

// New Community & Growth
import { DeveloperAnalytics } from './components/DeveloperAnalytics';
import { OpenSourceHub } from './components/OpenSourceHub';
import { DevMarketplace } from './components/DevMarketplace';
import { LearningOS } from './components/LearningOS';
import { GlobalNetwork } from './components/GlobalNetwork';

// Capstone
import { TesseraOSHub } from './components/TesseraOSHub';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [socraticTrigger, setSocraticTrigger] = useState<{ title: string; hint: string; code: string } | null>(null);

  const handleNavigate = (view: string) => {
    setActiveView(view);
  };

  const handleSocraticTrigger = (triggerData: { title: string; hint: string; code: string }) => {
    setSocraticTrigger(triggerData);
    setActiveView('mentor');
  };

  const NavButton = ({ id, icon: Icon, label, colorClass }: { id: string, icon: any, label: string, colorClass: string }) => {
    const isActive = activeView === id;
    return (
      <button
        onClick={() => handleNavigate(id)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
          isActive 
            ? `bg-slate-800/80 text-white shadow-lg border border-slate-700/50` 
            : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
        }`}
      >
        <Icon size={16} className={`${isActive ? colorClass : 'text-slate-500'}`} />
        <span className="text-xs font-medium truncate">{label}</span>
        {isActive && <div className={`ml-auto w-1.5 h-1.5 rounded-full ${colorClass.replace('text-', 'bg-')}`} />}
      </button>
    );
  };

  return (
    <div className="flex h-screen w-full bg-[#0b0f19] text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30 relative">
      <div className="bg-glow-container"></div>

      <nav className="w-64 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/80 flex flex-col z-20 relative shadow-2xl">
        <div className="h-14 flex items-center px-4 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg">
              <Terminal size={14} className="text-white" />
            </div>
            <span className="text-md font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Tessera.io OS
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 custom-scrollbar">
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-3 mt-2">Core Platform</div>
          <NavButton id="dashboard" icon={LayoutDashboard} label="Dashboard Hub" colorClass="text-cyan-400" />
          <NavButton id="tessera-hub" icon={Rocket} label="Tessera OS (Ph 25)" colorClass="text-emerald-400" />

          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-3 mt-4">IDE & Intel</div>
          <NavButton id="ide" icon={Terminal} label="Real-Time IDE (Ph 1, 5)" colorClass="text-emerald-400" />
          <NavButton id="code-completion" icon={Wand2} label="Code Completion (Ph 6)" colorClass="text-cyan-400" />
          <NavButton id="documentation" icon={FileText} label="AI Documentation (Ph 9)" colorClass="text-amber-400" />
          <NavButton id="testing" icon={TestTube2} label="Intelligent Testing (Ph 10)" colorClass="text-emerald-500" />
          <NavButton id="review" icon={Eye} label="Code Review Intel (Ph 11)" colorClass="text-indigo-400" />
          
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-3 mt-4">Collab & Learning</div>
          <NavButton id="mentor" icon={BrainCircuit} label="Socratic Mentor (Ph 2)" colorClass="text-purple-400" />
          <NavButton id="pair-programming" icon={Headphones} label="Pair Programming (Ph 15)" colorClass="text-pink-400" />
          <NavButton id="whiteboard" icon={Share2} label="Whiteboard (Ph 3)" colorClass="text-rose-400" />
          <NavButton id="learning" icon={GraduationCap} label="Learning OS (Ph 21)" colorClass="text-pink-400" />
          
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-3 mt-4">DevOps & Agents</div>
          <NavButton id="graph" icon={Network} label="Knowledge Graph (Ph 8)" colorClass="text-amber-400" />
          <NavButton id="devops" icon={Activity} label="DevOps Hub (Ph 12)" colorClass="text-emerald-500" />
          <NavButton id="agents" icon={Bot} label="Agent System (Ph 17)" colorClass="text-indigo-400" />
          <NavButton id="architecture" icon={Hexagon} label="Architecture Studio (Ph 18)" colorClass="text-purple-400" />
          <NavButton id="factory" icon={Factory} label="Software Factory (Ph 22)" colorClass="text-orange-400" />

          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-3 mt-4">Enviro & Growth</div>
          <NavButton id="github" icon={GitBranch} label="GitHub Integration (Ph 4)" colorClass="text-cyan-400" />
          <NavButton id="workspace" icon={Server} label="Workspace Manager (Ph 7)" colorClass="text-purple-400" />
          <NavButton id="cloud" icon={Cloud} label="Cloud Env (Ph 14)" colorClass="text-sky-400" />
          <NavButton id="security" icon={Shield} label="Enterprise Security (Ph 16)" colorClass="text-rose-400" />
          
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-3 mt-4">Community</div>
          <NavButton id="analytics" icon={BarChart3} label="Developer Analytics (Ph 13)" colorClass="text-cyan-400" />
          <NavButton id="twin" icon={UserCircle} label="Digital Twin (Ph 23)" colorClass="text-cyan-500" />
          <NavButton id="open-source" icon={Globe2} label="Open Source Hub (Ph 19)" colorClass="text-emerald-400" />
          <NavButton id="marketplace" icon={ShoppingBag} label="Dev Marketplace (Ph 20)" colorClass="text-amber-400" />
          <NavButton id="network" icon={Globe} label="Global Network (Ph 24)" colorClass="text-blue-400" />
        </div>
      </nav>

      <main className="flex-1 flex flex-col relative z-10 bg-[#0b0f19]/40 min-w-0">
        <header className="h-12 bg-slate-950/60 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-6 z-20 shrink-0">
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2 truncate">
            <span className="hidden sm:inline">Project: Tessera Developer OS</span>
            <span className="text-slate-600 hidden sm:inline">/</span>
            <span className="text-slate-300 capitalize">{activeView.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-[8px] font-bold text-cyan-400 z-30">AL</div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-400 font-medium">All Systems Nominal</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col relative">
          {activeView === 'dashboard' && <DashboardOverview onNavigate={handleNavigate} />}
          {activeView === 'ide' && <IDEWorkspace onSocraticTrigger={handleSocraticTrigger} />}
          {activeView === 'mentor' && <SocraticMentor incomingPrompt={socraticTrigger} />}
          {activeView === 'whiteboard' && <Whiteboard />}
          {activeView === 'graph' && <KnowledgeGraph />}
          {activeView === 'agents' && <AgentRoom />}
          {activeView === 'devops' && <DevOpsHub />}
          {activeView === 'twin' && <DigitalTwin />}
          
          {activeView === 'github' && <GitHubIntegration />}
          {activeView === 'workspace' && <WorkspaceManager />}
          {activeView === 'cloud' && <CloudEnvironment />}
          {activeView === 'security' && <EnterpriseSecurity />}
          
          {activeView === 'code-completion' && <AICodeCompletion />}
          {activeView === 'documentation' && <AIDocumentation />}
          {activeView === 'testing' && <IntelligentTesting />}
          {activeView === 'review' && <CodeReviewIntel />}
          {activeView === 'pair-programming' && <AIPairProgramming />}
          
          {activeView === 'architecture' && <ArchitectureStudio />}
          {activeView === 'factory' && <SoftwareFactory />}
          
          {activeView === 'analytics' && <DeveloperAnalytics />}
          {activeView === 'open-source' && <OpenSourceHub />}
          {activeView === 'marketplace' && <DevMarketplace />}
          {activeView === 'learning' && <LearningOS />}
          {activeView === 'network' && <GlobalNetwork />}
          
          {activeView === 'tessera-hub' && <TesseraOSHub />}
        </div>
      </main>
    </div>
  );
}

export default App;
