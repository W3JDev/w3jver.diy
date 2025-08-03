import type { AgentType, AgentSelection } from './agents';

export interface SerializableProjectContext {
  [key: string]: string | string[] | boolean | number;
  type: 'frontend' | 'backend' | 'fullstack' | 'database' | 'devops' | 'design' | 'unknown';
  technologies: string[];
  frameworks: string[];
  dependencies: string[];
  hasTests: boolean;
  hasDatabase: boolean;
  hasDocker: boolean;
  hasCI: boolean;
  fileCount: number;
}

export type ContextAnnotation =
  | {
      type: 'codeContext';
      files: string[];
    }
  | {
      type: 'chatSummary';
      summary: string;
      chatId: string;
    }
  | {
      type: 'agentSelection';
      selectedAgent: AgentType;
      confidence: number;
      reasoning: string;
      suggestedAgents: AgentType[];
      projectContext?: SerializableProjectContext;
    };

export type ProgressAnnotation = {
  type: 'progress';
  label: string;
  status: 'in-progress' | 'complete';
  order: number;
  message: string;
};

export type ToolCallAnnotation = {
  type: 'toolCall';
  toolCallId: string;
  serverName: string;
  toolName: string;
  toolDescription: string;
};
