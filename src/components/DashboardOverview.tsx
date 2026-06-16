import { Activity, BrainCircuit, Crown } from 'lucide-react';

export const DashboardOverview = ({ onNavigate }: { onNavigate: (view: string) => void }) => {
  const roadmapPhases = [
    { num: 1, title: 'Real-Time IDE', view: 'IDEWorkspace' },
    { num: 2, title: 'Socratic Mentor', view: 'SocraticMentor' },
    { num: 3, title: 'Whiteboard', view: 'Whiteboard' },
    { num: 4, title: 'GitHub Integration', view: 'GitHubIntegration' },
    { num: 5, title: 'Sandbox Expansion', view: 'IDEWorkspace' },
    { num: 6, title: 'Code Completion', view: 'AICodeCompletion' },
    { num: 7, title: 'Workspace Manager', view: 'WorkspaceManager' },
    { num: 8, title: 'Knowledge Graph', view: 'KnowledgeGraph' },
    { num: 9, title: 'AI Documentation', view: 'AIDocumentation' },
    { num: 10, title: 'Intelligent Testing', view: 'IntelligentTesting' },
    { num: 11, title: 'Code Review Intel', view: 'CodeReviewIntel' },
    { num: 12, title: 'DevOps Hub', view: 'DevOpsHub' },
    { num: 13, title: 'Developer Analytics', view: 'DeveloperAnalytics' },
    { num: 14, title: 'Cloud Env', view: 'CloudEnvironment' },
    { num: 15, title: 'Pair Programming', view: 'AIPairProgramming' },
    { num: 16, title: 'Enterprise Security', view: 'EnterpriseSecurity' },
    { num: 17, title: 'Agent System', view: 'AgentRoom' },
    { num: 18, title: 'Architecture Studio', view: 'ArchitectureStudio' },
    { num: 19, title: 'Open Source Hub', view: 'OpenSourceHub' },
    { num: 20, title: 'Dev Marketplace', view: 'DevMarketplace' },
    { num: 21, title: 'Learning OS', view: 'LearningOS' },
    { num: 22, title: 'Software Factory', view: 'SoftwareFactory' },
    { num: 23, title: 'Digital Twin', view: 'DigitalTwin' },
    { num: 24, title: 'Global Network', view: 'GlobalNetwork' },
    { num: 25, title: 'Tessera OS (Ph 25)', view: 'TesseraOSHub' },
    { num: 26, title: 'Enterprise Workspace', view: 'EnterpriseWorkspace' },
    { num: 27, title: 'AI Copilot Advanced', view: 'AICopilotAdvanced' },
    { num: 28, title: 'Code Intelligence', view: 'AdvancedCodeIntelligence' },
    { num: 29, title: 'Test Gen Platform', view: 'AITestGeneration' },
    { num: 30, title: 'Dev Knowledge Graph', view: 'KnowledgeGraphAdvanced' },
    { num: 31, title: 'AI Doc Platform', view: 'AIDocPlatform' },
    { num: 32, title: 'Collab Whiteboard', view: 'CollaborativeWhiteboard' },
    { num: 33, title: 'Project Management', view: 'ProjectManagement' },
    { num: 34, title: 'Advanced Analytics', view: 'AdvancedDevAnalytics' },
    { num: 35, title: 'Execution Engine', view: 'ExecutionEngine' },
    { num: 36, title: 'Security Review', view: 'SecurityReviewEngine' },
    { num: 37, title: 'Cloud Environment', view: 'CloudDevEnvironment' },
    { num: 38, title: 'DevOps Automation', view: 'DevOpsAutomation' },
    { num: 39, title: 'Architecture Assistant', view: 'AIArchitectureAssistant' },
    { num: 40, title: 'Multi-Agent Framework', view: 'MultiAgentFramework' },
    { num: 41, title: 'Learning Platform', view: 'DeveloperLearningPlatform' },
    { num: 42, title: 'Open Source Intel', view: 'OpenSourceIntelligence' },
    { num: 43, title: 'Marketplace Ext', view: 'MarketplaceExtensions' },
    { num: 44, title: 'Enterprise Gov', view: 'EnterpriseGovernance' },
    { num: 45, title: 'Global Collab', view: 'GlobalCollaborationAdvanced' },
    { num: 46, title: 'Digital Twin V2', view: 'DigitalTwinAdvanced' },
    { num: 47, title: 'AI Research', view: 'AIResearchWorkspace' },
    { num: 48, title: 'Autonomous Factory', view: 'AutonomousFactoryAdvanced' },
    { num: 49, title: 'OS Intelligence', view: 'IntelligenceLayer' },
    { num: 50, title: 'Tessera OS V2 (Ph 50)', view: 'TesseraOSHubV2' },
    { num: 51, title: 'Command Center', view: 'CommandCenter' },
    { num: 52, title: 'Engineering Manager', view: 'EngineeringManager' },
    { num: 53, title: 'Auto Code Review', view: 'AutoCodeReview' },
    { num: 54, title: 'Supply Chain Security', view: 'SupplyChainSecurity' },
    { num: 55, title: 'Digital Workspace', view: 'DigitalWorkspace' },
    { num: 56, title: 'Knowledge Fabric', view: 'KnowledgeFabric' },
    { num: 57, title: 'Repo Federation', view: 'RepositoryFederation' },
    { num: 58, title: 'Developer Identity', view: 'DeveloperIdentity' },
    { num: 59, title: 'Incident Intelligence', view: 'IncidentIntelligence' },
    { num: 60, title: 'Observability Hub', view: 'ObservabilityHub' },
    { num: 61, title: 'Product Platform', view: 'ProductDevPlatform' },
    { num: 62, title: 'Bug Intelligence', view: 'AutoBugIntelligence' },
    { num: 63, title: 'Arch Governance', view: 'ArchitectureGovernance' },
    { num: 64, title: 'Global Collab Network', view: 'GlobalCollabNetwork' },
    { num: 65, title: 'Research Lab', view: 'EngineeringResearchLab' },
    { num: 66, title: 'Testing Mesh', view: 'AutoTestingMesh' },
    { num: 67, title: 'DevSecOps Fabric', view: 'DevSecOpsFabric' },
    { num: 68, title: 'Plugin Ecosystem', view: 'PluginEcosystem' },
    { num: 69, title: 'Knowledge Agents', view: 'EngineeringKnowledgeAgents' },
    { num: 70, title: 'Learning OS V2', view: 'LearningOSV2' },
    { num: 71, title: 'Factory Control', view: 'SoftwareFactoryControl' },
    { num: 72, title: 'OSS Network', view: 'GlobalOSNetwork' },
    { num: 73, title: 'Data Lake', view: 'EngineeringDataLake' },
    { num: 74, title: 'Workforce Intel', view: 'WorkforceIntelligence' },
    { num: 75, title: 'Tessera Cloud Hub', view: 'TesseraCloudHub' },
    { num: 76, title: 'Global Intel', view: 'GlobalIntelligenceLayer' },
    { num: 77, title: 'Eng Memory', view: 'EngineeringMemoryPlatform' },
    { num: 78, title: 'Repo Fed V2', view: 'RepositoryFederationV2' },
    { num: 79, title: 'Data Fabric', view: 'EngineeringDataFabric' },
    { num: 80, title: 'Code Graph', view: 'GlobalCodeGraph' },
    { num: 81, title: 'Multi-Agent V2', view: 'MultiAgentFrameworkV2' },
    { num: 82, title: 'AI Swarm', view: 'AIDevelopmentSwarm' },
    { num: 83, title: 'Review Fed', view: 'AIReviewFederation' },
    { num: 84, title: 'Auto Refactoring', view: 'AutonomousRefactoring' },
    { num: 85, title: 'Agent Market', view: 'EngineeringAgentMarketplace' },
    { num: 86, title: 'AI Product Mgt', view: 'AIProductManagement' },
    { num: 87, title: 'AI BI Layer', view: 'AIBusinessIntelligence' },
    { num: 88, title: 'Dev Productivity', view: 'DeveloperProductivityIntel' },
    { num: 89, title: 'Sprint Manager', view: 'AutonomousSprintManager' },
    { num: 90, title: 'Eng Portfolio', view: 'EngineeringPortfolio' },
    { num: 91, title: 'Auto Factory', view: 'AutonomousSoftwareFactoryV3' },
    { num: 92, title: 'CD Intel', view: 'ContinuousDeliveryIntel' },
    { num: 93, title: 'AI QA Platform', view: 'AIQualityAssurance' },
    { num: 94, title: 'Auto Architecture', view: 'AutonomousArchitectureStudio' },
    { num: 95, title: 'Eng Simulation', view: 'EngineeringSimulation' },
    { num: 96, title: 'Digital Twin V3', view: 'EngineeringDigitalTwinV3' },
    { num: 97, title: 'Workforce Intel V2', view: 'AIWorkforceIntelligenceV2' },
    { num: 98, title: 'Research Cloud', view: 'EngineeringResearchCloud' },
    { num: 99, title: 'Innovation Net', view: 'EngineeringInnovationNetwork' },
    { num: 100, title: 'Tessera OS (Ph 100)', view: 'TesseraAutonomousOS' }
  ];

  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10 overflow-y-auto custom-scrollbar">
      <div className="mb-6 p-8 rounded-2xl glass-panel bg-gradient-to-r from-amber-900/40 to-indigo-900/40 border border-amber-800/80 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex gap-6 items-center">
          <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/30">
            <Crown size={48} className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2">Tessera Autonomous OS</h1>
            <p className="text-amber-200/80 max-w-2xl text-lg">
              Phase 100 Achieved: The World's First Global Autonomous Engineering Ecosystem is fully online and operational.
            </p>
            <div className="mt-4 flex gap-3">
              <button onClick={() => onNavigate('TesseraAutonomousOS')} className="px-6 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold transition-all shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                Initialize Global OS
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="glass-panel p-5 border border-slate-800/80 rounded-xl bg-slate-950/50 flex flex-col justify-between cursor-pointer hover:border-emerald-500/50" onClick={() => onNavigate('TesseraAutonomousOS')}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium">Platform Scale</p>
                <h3 className="text-3xl font-black text-slate-100 mt-1">100 Phases</h3>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><Activity size={20} /></div>
            </div>
          </div>
          <div className="glass-panel p-5 border border-slate-800/80 rounded-xl bg-slate-950/50 flex flex-col justify-between cursor-pointer hover:border-amber-500/50" onClick={() => onNavigate('AIDevelopmentSwarm')}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium">Active Swarm</p>
                <h3 className="text-2xl font-bold text-slate-100 mt-1">Fully Autonomous</h3>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400"><BrainCircuit size={20} /></div>
            </div>
          </div>
        </div>

        <div className="glass-panel border border-slate-800/80 rounded-xl bg-slate-950/50 flex flex-col h-96">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-200">OS Phase Explorer</h3>
              <p className="text-xs text-slate-500">Full 1-100 Roadmap</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
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
                <div className="flex-1 text-sm text-slate-300 group-hover:text-white transition-colors truncate">
                  {phase.title}
                </div>
                <div className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-emerald-500 transition-colors"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
