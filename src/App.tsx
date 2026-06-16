import { useState } from 'react';
import { 
  LayoutDashboard, Terminal, BrainCircuit, Share2, GitBranch, Wand2, Server, Network, 
  FileText, TestTube2, Eye, Activity, BarChart3, Cloud, Headphones, Shield, Bot, 
  Hexagon, Globe2, ShoppingBag, GraduationCap, Factory, UserCircle, Globe, Rocket,
  Building2, PenTool, Kanban, Lock, Users, Scale, Microscope, Layers, Monitor, 
  Briefcase, CheckSquare, ShieldAlert, Layout, Fingerprint, AlertTriangle, Package, 
  Bug, Puzzle, Database
} from 'lucide-react';

import { DashboardOverview } from './components/DashboardOverview';

// 1-25 Original
import { IDEWorkspace } from './components/IDEWorkspace';
import { SocraticMentor } from './components/SocraticMentor';
import { Whiteboard } from './components/Whiteboard';
import { GitHubIntegration } from './components/GitHubIntegration';
import { AICodeCompletion } from './components/AICodeCompletion';
import { WorkspaceManager } from './components/WorkspaceManager';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { AIDocumentation } from './components/AIDocumentation';
import { IntelligentTesting } from './components/IntelligentTesting';
import { CodeReviewIntel } from './components/CodeReviewIntel';
import { DevOpsHub } from './components/DevOpsHub';
import { DeveloperAnalytics } from './components/DeveloperAnalytics';
import { CloudEnvironment } from './components/CloudEnvironment';
import { AIPairProgramming } from './components/AIPairProgramming';
import { EnterpriseSecurity } from './components/EnterpriseSecurity';
import { AgentRoom } from './components/AgentRoom';
import { ArchitectureStudio } from './components/ArchitectureStudio';
import { OpenSourceHub } from './components/OpenSourceHub';
import { DevMarketplace } from './components/DevMarketplace';
import { LearningOS } from './components/LearningOS';
import { SoftwareFactory } from './components/SoftwareFactory';
import { DigitalTwin } from './components/DigitalTwin';
import { GlobalNetwork } from './components/GlobalNetwork';
import { TesseraOSHub } from './components/TesseraOSHub';

// 26-50 New
import { EnterpriseWorkspace } from './components/EnterpriseWorkspace';
import { AICopilotAdvanced } from './components/AICopilotAdvanced';
import { AdvancedCodeIntelligence } from './components/AdvancedCodeIntelligence';
import { AITestGeneration } from './components/AITestGeneration';
import { KnowledgeGraphAdvanced } from './components/KnowledgeGraphAdvanced';
import { AIDocPlatform } from './components/AIDocPlatform';
import { CollaborativeWhiteboard } from './components/CollaborativeWhiteboard';
import { ProjectManagement } from './components/ProjectManagement';
import { AdvancedDevAnalytics } from './components/AdvancedDevAnalytics';
import { ExecutionEngine } from './components/ExecutionEngine';
import { SecurityReviewEngine } from './components/SecurityReviewEngine';
import { CloudDevEnvironment } from './components/CloudDevEnvironment';
import { DevOpsAutomation } from './components/DevOpsAutomation';
import { AIArchitectureAssistant } from './components/AIArchitectureAssistant';
import { MultiAgentFramework } from './components/MultiAgentFramework';
import { DeveloperLearningPlatform } from './components/DeveloperLearningPlatform';
import { OpenSourceIntelligence } from './components/OpenSourceIntelligence';
import { MarketplaceExtensions } from './components/MarketplaceExtensions';
import { EnterpriseGovernance } from './components/EnterpriseGovernance';
import { GlobalCollaborationAdvanced } from './components/GlobalCollaborationAdvanced';
import { DigitalTwinAdvanced } from './components/DigitalTwinAdvanced';
import { AIResearchWorkspace } from './components/AIResearchWorkspace';
import { AutonomousFactoryAdvanced } from './components/AutonomousFactoryAdvanced';
import { IntelligenceLayer } from './components/IntelligenceLayer';
import { TesseraOSHubV2 } from './components/TesseraOSHubV2';

// 51-75 Advanced Cloud
import { CommandCenter } from './components/CommandCenter';
import { EngineeringManager } from './components/EngineeringManager';
import { AutoCodeReview } from './components/AutoCodeReview';
import { SupplyChainSecurity } from './components/SupplyChainSecurity';
import { DigitalWorkspace } from './components/DigitalWorkspace';
import { KnowledgeFabric } from './components/KnowledgeFabric';
import { RepositoryFederation } from './components/RepositoryFederation';
import { DeveloperIdentity } from './components/DeveloperIdentity';
import { IncidentIntelligence } from './components/IncidentIntelligence';
import { ObservabilityHub } from './components/ObservabilityHub';
import { ProductDevPlatform } from './components/ProductDevPlatform';
import { AutoBugIntelligence } from './components/AutoBugIntelligence';
import { ArchitectureGovernance } from './components/ArchitectureGovernance';
import { GlobalCollabNetwork } from './components/GlobalCollabNetwork';
import { EngineeringResearchLab } from './components/EngineeringResearchLab';
import { AutoTestingMesh } from './components/AutoTestingMesh';
import { DevSecOpsFabric } from './components/DevSecOpsFabric';
import { PluginEcosystem } from './components/PluginEcosystem';
import { EngineeringKnowledgeAgents } from './components/EngineeringKnowledgeAgents';
import { LearningOSV2 } from './components/LearningOSV2';
import { SoftwareFactoryControl } from './components/SoftwareFactoryControl';
import { GlobalOSNetwork } from './components/GlobalOSNetwork';
import { EngineeringDataLake } from './components/EngineeringDataLake';
import { WorkforceIntelligence } from './components/WorkforceIntelligence';
import { TesseraCloudHub } from './components/TesseraCloudHub';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [socraticTrigger, setSocraticTrigger] = useState<{ title: string; hint: string; code: string } | null>(null);

  const handleNavigate = (view: string) => setActiveView(view);

  const handleSocraticTrigger = (triggerData: { title: string; hint: string; code: string }) => {
    setSocraticTrigger(triggerData);
    setActiveView('SocraticMentor');
  };

  const NavButton = ({ id, icon: Icon, label, colorClass }: { id: string, icon: any, label: string, colorClass: string }) => {
    const isActive = activeView === id;
    const btnClass = "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 " + (isActive ? "bg-slate-800/80 text-white shadow-lg border border-slate-700/50" : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent");
    const iconClass = isActive ? colorClass : "text-slate-500";
    const dotClass = "ml-auto w-1.5 h-1.5 rounded-full " + colorClass.replace('text-', 'bg-');
    
    return (
      <button onClick={() => handleNavigate(id)} className={btnClass}>
        <Icon size={16} className={iconClass} />
        <span className="text-xs font-medium truncate">{label}</span>
        {isActive && <div className={dotClass} />}
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
              Tessera.io OS (v75)
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 custom-scrollbar">
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-3 mt-2">Core Navigation</div>
          <NavButton id="dashboard" icon={LayoutDashboard} label="Dashboard Hub" colorClass="text-cyan-400" />
          
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-3 mt-4">Phases 1-25 (Foundation)</div>
          <NavButton id="IDEWorkspace" icon={Terminal} label="Real-Time IDE (Ph 1)" colorClass="text-emerald-400" />
          <NavButton id="SocraticMentor" icon={BrainCircuit} label="Socratic Mentor (Ph 2)" colorClass="text-purple-400" />
          <NavButton id="Whiteboard" icon={Share2} label="Whiteboard (Ph 3)" colorClass="text-rose-400" />
          <NavButton id="GitHubIntegration" icon={GitBranch} label="GitHub Integration (Ph 4)" colorClass="text-cyan-400" />
          <NavButton id="AICodeCompletion" icon={Wand2} label="Code Completion (Ph 6)" colorClass="text-cyan-400" />
          <NavButton id="WorkspaceManager" icon={Server} label="Workspace Manager (Ph 7)" colorClass="text-purple-400" />
          <NavButton id="KnowledgeGraph" icon={Network} label="Knowledge Graph (Ph 8)" colorClass="text-amber-400" />
          <NavButton id="AIDocumentation" icon={FileText} label="AI Documentation (Ph 9)" colorClass="text-amber-400" />
          <NavButton id="IntelligentTesting" icon={TestTube2} label="Intelligent Testing (Ph 10)" colorClass="text-emerald-500" />
          <NavButton id="CodeReviewIntel" icon={Eye} label="Code Review Intel (Ph 11)" colorClass="text-indigo-400" />
          <NavButton id="DevOpsHub" icon={Activity} label="DevOps Hub (Ph 12)" colorClass="text-emerald-500" />
          <NavButton id="DeveloperAnalytics" icon={BarChart3} label="Developer Analytics (Ph 13)" colorClass="text-cyan-400" />
          <NavButton id="CloudEnvironment" icon={Cloud} label="Cloud Env (Ph 14)" colorClass="text-sky-400" />
          <NavButton id="AIPairProgramming" icon={Headphones} label="Pair Programming (Ph 15)" colorClass="text-pink-400" />
          <NavButton id="EnterpriseSecurity" icon={Shield} label="Enterprise Security (Ph 16)" colorClass="text-rose-400" />
          <NavButton id="AgentRoom" icon={Bot} label="Agent System (Ph 17)" colorClass="text-indigo-400" />
          <NavButton id="ArchitectureStudio" icon={Hexagon} label="Architecture Studio (Ph 18)" colorClass="text-purple-400" />
          <NavButton id="OpenSourceHub" icon={Globe2} label="Open Source Hub (Ph 19)" colorClass="text-emerald-400" />
          <NavButton id="DevMarketplace" icon={ShoppingBag} label="Dev Marketplace (Ph 20)" colorClass="text-amber-400" />
          <NavButton id="LearningOS" icon={GraduationCap} label="Learning OS (Ph 21)" colorClass="text-pink-400" />
          <NavButton id="SoftwareFactory" icon={Factory} label="Software Factory (Ph 22)" colorClass="text-orange-400" />
          <NavButton id="DigitalTwin" icon={UserCircle} label="Digital Twin (Ph 23)" colorClass="text-cyan-500" />
          <NavButton id="GlobalNetwork" icon={Globe} label="Global Network (Ph 24)" colorClass="text-blue-400" />
          <NavButton id="TesseraOSHub" icon={Rocket} label="Tessera OS (Ph 25)" colorClass="text-emerald-400" />

          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-3 mt-4">Phases 26-50 (Autonomous)</div>
          <NavButton id="EnterpriseWorkspace" icon={Building2} label="Enterprise Workspace (Ph 26)" colorClass="text-indigo-400" />
          <NavButton id="AICopilotAdvanced" icon={Bot} label="AI Copilot Advanced (Ph 27)" colorClass="text-cyan-400" />
          <NavButton id="AdvancedCodeIntelligence" icon={BrainCircuit} label="Code Intelligence (Ph 28)" colorClass="text-purple-400" />
          <NavButton id="AITestGeneration" icon={TestTube2} label="Test Gen Platform (Ph 29)" colorClass="text-emerald-400" />
          <NavButton id="KnowledgeGraphAdvanced" icon={Network} label="Dev Knowledge Graph (Ph 30)" colorClass="text-amber-400" />
          <NavButton id="AIDocPlatform" icon={FileText} label="AI Doc Platform (Ph 31)" colorClass="text-sky-400" />
          <NavButton id="CollaborativeWhiteboard" icon={PenTool} label="Collab Whiteboard (Ph 32)" colorClass="text-rose-400" />
          <NavButton id="ProjectManagement" icon={Kanban} label="Project Management (Ph 33)" colorClass="text-blue-400" />
          <NavButton id="AdvancedDevAnalytics" icon={BarChart3} label="Advanced Analytics (Ph 34)" colorClass="text-teal-400" />
          <NavButton id="ExecutionEngine" icon={Shield} label="Execution Engine (Ph 35)" colorClass="text-red-400" />
          <NavButton id="SecurityReviewEngine" icon={Lock} label="Security Review (Ph 36)" colorClass="text-orange-400" />
          <NavButton id="CloudDevEnvironment" icon={Cloud} label="Cloud Environment (Ph 37)" colorClass="text-sky-500" />
          <NavButton id="DevOpsAutomation" icon={Activity} label="DevOps Automation (Ph 38)" colorClass="text-emerald-500" />
          <NavButton id="AIArchitectureAssistant" icon={Hexagon} label="Architecture Assistant (Ph 39)" colorClass="text-purple-500" />
          <NavButton id="MultiAgentFramework" icon={Users} label="Multi-Agent Framework (Ph 40)" colorClass="text-indigo-500" />
          <NavButton id="DeveloperLearningPlatform" icon={GraduationCap} label="Learning Platform (Ph 41)" colorClass="text-pink-400" />
          <NavButton id="OpenSourceIntelligence" icon={Globe2} label="Open Source Intel (Ph 42)" colorClass="text-green-400" />
          <NavButton id="MarketplaceExtensions" icon={ShoppingBag} label="Marketplace Ext (Ph 43)" colorClass="text-amber-500" />
          <NavButton id="EnterpriseGovernance" icon={Scale} label="Enterprise Gov (Ph 44)" colorClass="text-slate-400" />
          <NavButton id="GlobalCollaborationAdvanced" icon={Globe} label="Global Collab (Ph 45)" colorClass="text-blue-500" />
          <NavButton id="DigitalTwinAdvanced" icon={UserCircle} label="Digital Twin V2 (Ph 46)" colorClass="text-cyan-500" />
          <NavButton id="AIResearchWorkspace" icon={Microscope} label="AI Research (Ph 47)" colorClass="text-fuchsia-400" />
          <NavButton id="AutonomousFactoryAdvanced" icon={Factory} label="Autonomous Factory (Ph 48)" colorClass="text-orange-500" />
          <NavButton id="IntelligenceLayer" icon={Layers} label="OS Intelligence (Ph 49)" colorClass="text-indigo-300" />
          <NavButton id="TesseraOSHubV2" icon={Rocket} label="Tessera OS V2 (Ph 50)" colorClass="text-emerald-400" />

          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-3 mt-4">Phases 51-75 (Cloud)</div>
          <NavButton id="CommandCenter" icon={Monitor} label="Command Center (Ph 51)" colorClass="text-indigo-400" />
          <NavButton id="EngineeringManager" icon={Briefcase} label="Eng Manager (Ph 52)" colorClass="text-cyan-400" />
          <NavButton id="AutoCodeReview" icon={CheckSquare} label="Auto Review (Ph 53)" colorClass="text-emerald-400" />
          <NavButton id="SupplyChainSecurity" icon={ShieldAlert} label="Supply Chain (Ph 54)" colorClass="text-red-400" />
          <NavButton id="DigitalWorkspace" icon={Layout} label="Digital Workspace (Ph 55)" colorClass="text-purple-400" />
          <NavButton id="KnowledgeFabric" icon={Network} label="Knowledge Fabric (Ph 56)" colorClass="text-amber-400" />
          <NavButton id="RepositoryFederation" icon={Globe2} label="Repo Federation (Ph 57)" colorClass="text-blue-400" />
          <NavButton id="DeveloperIdentity" icon={Fingerprint} label="Dev Identity (Ph 58)" colorClass="text-slate-400" />
          <NavButton id="IncidentIntelligence" icon={AlertTriangle} label="Incident Intel (Ph 59)" colorClass="text-orange-400" />
          <NavButton id="ObservabilityHub" icon={Activity} label="Observability (Ph 60)" colorClass="text-teal-400" />
          <NavButton id="ProductDevPlatform" icon={Package} label="Product Platform (Ph 61)" colorClass="text-fuchsia-400" />
          <NavButton id="AutoBugIntelligence" icon={Bug} label="Bug Intelligence (Ph 62)" colorClass="text-red-500" />
          <NavButton id="ArchitectureGovernance" icon={Hexagon} label="Arch Governance (Ph 63)" colorClass="text-indigo-500" />
          <NavButton id="GlobalCollabNetwork" icon={Users} label="Global Collab (Ph 64)" colorClass="text-blue-500" />
          <NavButton id="EngineeringResearchLab" icon={Microscope} label="Research Lab (Ph 65)" colorClass="text-purple-500" />
          <NavButton id="AutoTestingMesh" icon={TestTube2} label="Testing Mesh (Ph 66)" colorClass="text-emerald-500" />
          <NavButton id="DevSecOpsFabric" icon={Lock} label="DevSecOps (Ph 67)" colorClass="text-slate-500" />
          <NavButton id="PluginEcosystem" icon={Puzzle} label="Plugin Ecosystem (Ph 68)" colorClass="text-amber-500" />
          <NavButton id="EngineeringKnowledgeAgents" icon={Bot} label="Knowledge Agents (Ph 69)" colorClass="text-cyan-500" />
          <NavButton id="LearningOSV2" icon={GraduationCap} label="Learning OS V2 (Ph 70)" colorClass="text-pink-500" />
          <NavButton id="SoftwareFactoryControl" icon={Factory} label="Factory Control (Ph 71)" colorClass="text-orange-500" />
          <NavButton id="GlobalOSNetwork" icon={Share2} label="OSS Network (Ph 72)" colorClass="text-emerald-400" />
          <NavButton id="EngineeringDataLake" icon={Database} label="Data Lake (Ph 73)" colorClass="text-blue-300" />
          <NavButton id="WorkforceIntelligence" icon={BarChart3} label="Workforce Intel (Ph 74)" colorClass="text-teal-500" />
          <NavButton id="TesseraCloudHub" icon={Cloud} label="Tessera Cloud (Ph 75)" colorClass="text-sky-500" />

        </div>
      </nav>

      <main className="flex-1 flex flex-col relative z-10 bg-[#0b0f19]/40 min-w-0">
        <header className="h-12 bg-slate-950/60 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-6 z-20 shrink-0">
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2 truncate">
            <span className="hidden sm:inline">Project: Tessera OS v75</span>
            <span className="text-slate-600 hidden sm:inline">/</span>
            <span className="text-slate-300 capitalize">{activeView.replace(/([A-Z])/g, ' $1').trim()}</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-[8px] font-bold text-cyan-400 z-30">AL</div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-400 font-medium">All 75 Subsystems Online</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col relative">
          {activeView === 'dashboard' && <DashboardOverview onNavigate={handleNavigate} />}
          
          {/* Original 1-25 */}
          {activeView === 'IDEWorkspace' && <IDEWorkspace onSocraticTrigger={handleSocraticTrigger} />}
          {activeView === 'SocraticMentor' && <SocraticMentor incomingPrompt={socraticTrigger} />}
          {activeView === 'Whiteboard' && <Whiteboard />}
          {activeView === 'GitHubIntegration' && <GitHubIntegration />}
          {activeView === 'AICodeCompletion' && <AICodeCompletion />}
          {activeView === 'WorkspaceManager' && <WorkspaceManager />}
          {activeView === 'KnowledgeGraph' && <KnowledgeGraph />}
          {activeView === 'AIDocumentation' && <AIDocumentation />}
          {activeView === 'IntelligentTesting' && <IntelligentTesting />}
          {activeView === 'CodeReviewIntel' && <CodeReviewIntel />}
          {activeView === 'DevOpsHub' && <DevOpsHub />}
          {activeView === 'DeveloperAnalytics' && <DeveloperAnalytics />}
          {activeView === 'CloudEnvironment' && <CloudEnvironment />}
          {activeView === 'AIPairProgramming' && <AIPairProgramming />}
          {activeView === 'EnterpriseSecurity' && <EnterpriseSecurity />}
          {activeView === 'AgentRoom' && <AgentRoom />}
          {activeView === 'ArchitectureStudio' && <ArchitectureStudio />}
          {activeView === 'OpenSourceHub' && <OpenSourceHub />}
          {activeView === 'DevMarketplace' && <DevMarketplace />}
          {activeView === 'LearningOS' && <LearningOS />}
          {activeView === 'SoftwareFactory' && <SoftwareFactory />}
          {activeView === 'DigitalTwin' && <DigitalTwin />}
          {activeView === 'GlobalNetwork' && <GlobalNetwork />}
          {activeView === 'TesseraOSHub' && <TesseraOSHub />}

          {/* New 26-50 */}
          {activeView === 'EnterpriseWorkspace' && <EnterpriseWorkspace />}
          {activeView === 'AICopilotAdvanced' && <AICopilotAdvanced />}
          {activeView === 'AdvancedCodeIntelligence' && <AdvancedCodeIntelligence />}
          {activeView === 'AITestGeneration' && <AITestGeneration />}
          {activeView === 'KnowledgeGraphAdvanced' && <KnowledgeGraphAdvanced />}
          {activeView === 'AIDocPlatform' && <AIDocPlatform />}
          {activeView === 'CollaborativeWhiteboard' && <CollaborativeWhiteboard />}
          {activeView === 'ProjectManagement' && <ProjectManagement />}
          {activeView === 'AdvancedDevAnalytics' && <AdvancedDevAnalytics />}
          {activeView === 'ExecutionEngine' && <ExecutionEngine />}
          {activeView === 'SecurityReviewEngine' && <SecurityReviewEngine />}
          {activeView === 'CloudDevEnvironment' && <CloudDevEnvironment />}
          {activeView === 'DevOpsAutomation' && <DevOpsAutomation />}
          {activeView === 'AIArchitectureAssistant' && <AIArchitectureAssistant />}
          {activeView === 'MultiAgentFramework' && <MultiAgentFramework />}
          {activeView === 'DeveloperLearningPlatform' && <DeveloperLearningPlatform />}
          {activeView === 'OpenSourceIntelligence' && <OpenSourceIntelligence />}
          {activeView === 'MarketplaceExtensions' && <MarketplaceExtensions />}
          {activeView === 'EnterpriseGovernance' && <EnterpriseGovernance />}
          {activeView === 'GlobalCollaborationAdvanced' && <GlobalCollaborationAdvanced />}
          {activeView === 'DigitalTwinAdvanced' && <DigitalTwinAdvanced />}
          {activeView === 'AIResearchWorkspace' && <AIResearchWorkspace />}
          {activeView === 'AutonomousFactoryAdvanced' && <AutonomousFactoryAdvanced />}
          {activeView === 'IntelligenceLayer' && <IntelligenceLayer />}
          {activeView === 'TesseraOSHubV2' && <TesseraOSHubV2 />}

          {/* New 51-75 */}
          {activeView === 'CommandCenter' && <CommandCenter />}
          {activeView === 'EngineeringManager' && <EngineeringManager />}
          {activeView === 'AutoCodeReview' && <AutoCodeReview />}
          {activeView === 'SupplyChainSecurity' && <SupplyChainSecurity />}
          {activeView === 'DigitalWorkspace' && <DigitalWorkspace />}
          {activeView === 'KnowledgeFabric' && <KnowledgeFabric />}
          {activeView === 'RepositoryFederation' && <RepositoryFederation />}
          {activeView === 'DeveloperIdentity' && <DeveloperIdentity />}
          {activeView === 'IncidentIntelligence' && <IncidentIntelligence />}
          {activeView === 'ObservabilityHub' && <ObservabilityHub />}
          {activeView === 'ProductDevPlatform' && <ProductDevPlatform />}
          {activeView === 'AutoBugIntelligence' && <AutoBugIntelligence />}
          {activeView === 'ArchitectureGovernance' && <ArchitectureGovernance />}
          {activeView === 'GlobalCollabNetwork' && <GlobalCollabNetwork />}
          {activeView === 'EngineeringResearchLab' && <EngineeringResearchLab />}
          {activeView === 'AutoTestingMesh' && <AutoTestingMesh />}
          {activeView === 'DevSecOpsFabric' && <DevSecOpsFabric />}
          {activeView === 'PluginEcosystem' && <PluginEcosystem />}
          {activeView === 'EngineeringKnowledgeAgents' && <EngineeringKnowledgeAgents />}
          {activeView === 'LearningOSV2' && <LearningOSV2 />}
          {activeView === 'SoftwareFactoryControl' && <SoftwareFactoryControl />}
          {activeView === 'GlobalOSNetwork' && <GlobalOSNetwork />}
          {activeView === 'EngineeringDataLake' && <EngineeringDataLake />}
          {activeView === 'WorkforceIntelligence' && <WorkforceIntelligence />}
          {activeView === 'TesseraCloudHub' && <TesseraCloudHub />}
        </div>
      </main>
    </div>
  );
}

export default App;
