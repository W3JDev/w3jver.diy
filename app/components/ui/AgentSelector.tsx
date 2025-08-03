import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassMorphismContainer } from './GlassMorphismContainer';
import { getAllAgents, getAgentByType } from '~/lib/agents/agent-definitions';
import type { AgentType } from '~/types/agents';
import { classNames } from '~/utils/classNames';

interface AgentSelectorProps {
  selectedAgent?: AgentType;
  onAgentSelect: (agentType: AgentType) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const AgentSelector: React.FC<AgentSelectorProps> = ({
  selectedAgent = 'general',
  onAgentSelect,
  onClose,
  isOpen
}) => {
  const [hoveredAgent, setHoveredAgent] = useState<AgentType | null>(null);
  const agents = getAllAgents();

  const handleAgentSelect = (agentType: AgentType) => {
    onAgentSelect(agentType);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Agent Selector */}
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl mx-4"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <GlassMorphismContainer intensity="heavy" shadow={true} borderGlow={true}>
              <div className="p-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Select AI Agent</h2>
                  <p className="text-white/70">Choose a specialized agent for your project needs</p>
                </div>

                {/* Agent Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto modern-scrollbar">
                  {agents.map((agent) => {
                    const isSelected = selectedAgent === agent.id;
                    const isHovered = hoveredAgent === agent.id;

                    return (
                      <motion.button
                        key={agent.id}
                        className={classNames(
                          'relative p-4 rounded-xl border transition-all duration-200 text-left',
                          isSelected
                            ? 'border-w3j-primary-500 bg-w3j-primary-500/20'
                            : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
                        )}
                        onClick={() => handleAgentSelect(agent.id)}
                        onMouseEnter={() => setHoveredAgent(agent.id)}
                        onMouseLeave={() => setHoveredAgent(null)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Agent Icon with Gradient Background */}
                        <div className={classNames(
                          'w-12 h-12 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br',
                          agent.color
                        )}>
                          <div className={classNames(agent.icon, 'text-2xl text-white')} />
                        </div>

                        {/* Agent Info */}
                        <div>
                          <h3 className="font-semibold text-white mb-1">{agent.name}</h3>
                          <p className="text-sm text-white/70 mb-3 line-clamp-2">{agent.description}</p>
                          
                          {/* Expertise Tags */}
                          <div className="flex flex-wrap gap-1">
                            {agent.expertise.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/80"
                              >
                                {skill}
                              </span>
                            ))}
                            {agent.expertise.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/60">
                                +{agent.expertise.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Selection Indicator */}
                        {isSelected && (
                          <motion.div
                            className="absolute top-2 right-2 w-6 h-6 bg-w3j-primary-500 rounded-full flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="i-ph:check text-white text-sm" />
                          </motion.div>
                        )}

                        {/* Hover Effect */}
                        <AnimatePresence>
                          {isHovered && !isSelected && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-br from-w3j-primary-500/10 to-w3j-secondary-500/10 rounded-xl"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Agent Details Panel */}
                {hoveredAgent && (
                  <motion.div
                    className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {(() => {
                      const agent = getAgentByType(hoveredAgent);
                      return (
                        <div>
                          <h4 className="font-semibold text-white mb-2">{agent.name} Capabilities</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {agent.capabilities.map((capability) => (
                              <div key={capability} className="flex items-center gap-2 text-sm text-white/80">
                                <div className="w-1.5 h-1.5 bg-w3j-primary-500 rounded-full" />
                                {capability}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="text-sm text-white/60">
                    Selected: {getAgentByType(selectedAgent).name}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAgentSelect(selectedAgent)}
                      className="px-4 py-2 bg-w3j-primary-500 text-white text-sm rounded-lg hover:bg-w3j-primary-600 transition-colors"
                    >
                      Confirm Selection
                    </button>
                  </div>
                </div>
              </div>
            </GlassMorphismContainer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const useAgentSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('general');

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    selectedAgent,
    open,
    close,
    setSelectedAgent,
    AgentSelector: (props: Omit<AgentSelectorProps, 'isOpen' | 'onClose' | 'selectedAgent'>) => (
      <AgentSelector 
        isOpen={isOpen} 
        onClose={close} 
        selectedAgent={selectedAgent} 
        {...props} 
      />
    ),
  };
};