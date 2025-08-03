import React from 'react';
import { motion } from 'framer-motion';
import { getAgentByType } from '~/lib/agents/agent-definitions';
import type { AgentType } from '~/types/agents';
import { classNames } from '~/utils/classNames';
import { GlassMorphismContainer } from './GlassMorphismContainer';

interface AgentStatusIndicatorProps {
  selectedAgent: AgentType;
  onOpenAgentSelector: () => void;
  className?: string;
}

export const AgentStatusIndicator: React.FC<AgentStatusIndicatorProps> = ({
  selectedAgent,
  onOpenAgentSelector,
  className = ''
}) => {
  const agent = getAgentByType(selectedAgent);

  return (
    <motion.button
      onClick={onOpenAgentSelector}
      className={classNames(
        'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
        'hover:scale-105 active:scale-95',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <GlassMorphismContainer 
        intensity="light" 
        className="flex items-center gap-2 px-3 py-2 min-w-0"
      >
        {/* Agent Icon */}
        <div className={classNames(
          'w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br flex-shrink-0',
          agent.color
        )}>
          <div className={classNames(agent.icon, 'text-lg text-white')} />
        </div>

        {/* Agent Info */}
        <div className="flex flex-col items-start min-w-0">
          <div className="text-sm font-medium text-white truncate">
            {agent.name}
          </div>
          <div className="text-xs text-white/70 truncate">
            {selectedAgent === 'general' ? 'General Assistant' : 'Specialized Agent'}
          </div>
        </div>

        {/* Switch Indicator */}
        <div className="flex items-center gap-1 ml-auto flex-shrink-0">
          <div className="text-xs text-white/60">Switch</div>
          <div className="i-ph:caret-down text-white/60" />
        </div>
      </GlassMorphismContainer>
    </motion.button>
  );
};