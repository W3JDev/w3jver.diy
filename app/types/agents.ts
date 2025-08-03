export type AgentType = 
  | 'frontend-specialist'
  | 'backend-architect' 
  | 'database-master'
  | 'devops-commander'
  | 'design-guru'
  | 'performance-optimizer'
  | 'testing-specialist'
  | 'general';

export interface Agent {
  id: AgentType;
  name: string;
  description: string;
  expertise: string[];
  icon: string;
  color: string;
  capabilities: string[];
  promptTemplate: string;
  keywords: string[];
}

export interface ProjectContext {
  type: 'frontend' | 'backend' | 'fullstack' | 'database' | 'devops' | 'design' | 'unknown';
  technologies: string[];
  frameworks: string[];
  files: { [path: string]: string };
  dependencies: string[];
  hasTests: boolean;
  hasDatabase: boolean;
  hasDocker: boolean;
  hasCI: boolean;
}

export interface AgentSelection {
  selectedAgent: AgentType;
  confidence: number;
  reasoning: string;
  suggestedAgents: AgentType[];
}

export interface AgentMessage {
  agentId: AgentType;
  content: string;
  timestamp: number;
  context?: ProjectContext;
}