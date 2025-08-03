import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { classNames } from '~/utils/classNames';
import { GlassMorphismContainer } from './GlassMorphismContainer';
import { getAllAgents } from '~/lib/agents/agent-definitions';
import { STARTER_TEMPLATES } from '~/utils/constants';
import type { AgentType } from '~/types/agents';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
  onAgentSelect?: (agentType: AgentType) => void;
}

interface Command {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  category: string;
  keywords: string[];
  action: () => void;
}

const commands: Command[] = [
  // Agent Selection Commands
  ...getAllAgents().map(agent => ({
    id: `agent-${agent.id}`,
    title: `Switch to ${agent.name}`,
    description: agent.description,
    icon: agent.icon,
    category: 'Agents',
    keywords: ['agent', 'ai', 'switch', agent.name.toLowerCase(), ...agent.keywords],
    action: () => console.log(`Switch to ${agent.name}`),
  })),
  
  // Template Library Commands
  ...STARTER_TEMPLATES.map(template => ({
    id: `template-${template.name}`,
    title: `Create ${template.label}`,
    description: template.description,
    icon: template.icon,
    category: 'Templates',
    keywords: ['template', 'create', 'new', template.name.toLowerCase(), ...(template.tags || [])],
    action: () => window.open(`/git?url=https://github.com/${template.githubRepo}.git`, '_self'),
  })),
  
  // Deployment Commands
  {
    id: 'deploy-vercel',
    title: 'Deploy to Vercel',
    description: 'Deploy current project to Vercel',
    icon: 'i-ph:rocket',
    category: 'Deploy',
    keywords: ['deploy', 'vercel', 'publish', 'production'],
    action: () => console.log('Deploy to Vercel'),
  },
  {
    id: 'deploy-netlify',
    title: 'Deploy to Netlify',
    description: 'Deploy current project to Netlify',
    icon: 'i-ph:rocket',
    category: 'Deploy',
    keywords: ['deploy', 'netlify', 'publish', 'production'],
    action: () => console.log('Deploy to Netlify'),
  },
  {
    id: 'deploy-cloudflare',
    title: 'Deploy to Cloudflare Pages',
    description: 'Deploy current project to Cloudflare Pages',
    icon: 'i-ph:rocket',
    category: 'Deploy',
    keywords: ['deploy', 'cloudflare', 'pages', 'publish'],
    action: () => console.log('Deploy to Cloudflare'),
  },
  
  // Quick Actions
  {
    id: 'preview-project',
    title: 'Open Preview',
    description: 'Open project preview in new tab',
    icon: 'i-ph:eye',
    category: 'Quick Actions',
    keywords: ['preview', 'view', 'open', 'demo'],
    action: () => console.log('Open preview'),
  },
  {
    id: 'download-project',
    title: 'Download Project',
    description: 'Download project as ZIP file',
    icon: 'i-ph:download',
    category: 'Quick Actions',
    keywords: ['download', 'export', 'zip', 'save'],
    action: () => console.log('Download project'),
  },
  {
    id: 'share-project',
    title: 'Share Project',
    description: 'Get shareable link for project',
    icon: 'i-ph:share',
    category: 'Quick Actions',
    keywords: ['share', 'link', 'collaborate'],
    action: () => console.log('Share project'),
  },
  
  // Existing Commands
  {
    id: 'new-project',
    title: 'New Project',
    description: 'Start a new W3Jverse project',
    icon: 'i-ph:plus-circle',
    category: 'Project',
    keywords: ['new', 'create', 'project', 'start'],
    action: () => console.log('New project'),
  },
  {
    id: 'open-settings',
    title: 'Settings',
    description: 'Open application settings',
    icon: 'i-ph:gear',
    category: 'App',
    keywords: ['settings', 'preferences', 'config'],
    action: () => console.log('Open settings'),
  },
  {
    id: 'switch-theme',
    title: 'Switch Theme',
    description: 'Toggle between light and dark theme',
    icon: 'i-ph:moon',
    category: 'App',
    keywords: ['theme', 'dark', 'light', 'mode'],
    action: () => console.log('Switch theme'),
  },
  {
    id: 'deploy-vercel',
    title: 'Deploy to Vercel',
    description: 'Deploy current project to Vercel',
    icon: 'i-ph:rocket',
    category: 'Deploy',
    keywords: ['deploy', 'vercel', 'publish'],
    action: () => console.log('Deploy to Vercel'),
  },
  {
    id: 'deploy-netlify',
    title: 'Deploy to Netlify',
    description: 'Deploy current project to Netlify',
    icon: 'i-ph:rocket',
    category: 'Deploy',
    keywords: ['deploy', 'netlify', 'publish'],
    action: () => console.log('Deploy to Netlify'),
  },
  {
    id: 'export-project',
    title: 'Export Project',
    description: 'Download project as ZIP',
    icon: 'i-ph:download',
    category: 'Project',
    keywords: ['export', 'download', 'zip', 'save'],
    action: () => console.log('Export project'),
  },
  {
    id: 'import-project',
    title: 'Import Project',
    description: 'Import project from file or Git',
    icon: 'i-ph:upload',
    category: 'Project',
    keywords: ['import', 'upload', 'git', 'load'],
    action: () => console.log('Import project'),
  },
  {
    id: 'voice-input',
    title: 'Voice Input',
    description: 'Start voice recognition',
    icon: 'i-ph:microphone',
    category: 'Input',
    keywords: ['voice', 'speech', 'microphone', 'talk'],
    action: () => console.log('Voice input'),
  },
  {
    id: 'ai-models',
    title: 'AI Models',
    description: 'Switch AI model or provider',
    icon: 'i-ph:brain',
    category: 'AI',
    keywords: ['ai', 'model', 'provider', 'gpt', 'claude'],
    action: () => console.log('AI models'),
  },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onCommand, onAgentSelect }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(search.toLowerCase()) ||
      cmd.keywords.some((keyword) => keyword.toLowerCase().includes(search.toLowerCase())),
  );

  const categories = Array.from(new Set(filteredCommands.map((cmd) => cmd.category)));

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Keyboard navigation
  useHotkeys('escape', onClose, { enabled: isOpen });
  useHotkeys(
    'enter',
    () => {
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onCommand(filteredCommands[selectedIndex].id);
        onClose();
      }
    },
    { enabled: isOpen },
  );

  useHotkeys(
    'arrowdown',
    () => {
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
    },
    { enabled: isOpen, preventDefault: true },
  );

  useHotkeys(
    'arrowup',
    () => {
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    },
    { enabled: isOpen, preventDefault: true },
  );

  const executeCommand = (command: Command) => {
    // Handle agent selection commands
    if (command.id.startsWith('agent-') && onAgentSelect) {
      const agentType = command.id.replace('agent-', '') as AgentType;
      onAgentSelect(agentType);
    } else {
      command.action();
    }
    onCommand(command.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Command Palette */}
          <motion.div
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl mx-4"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <GlassMorphismContainer intensity="heavy" shadow={true} borderGlow={true} className="overflow-hidden">
              {/* Search Input */}
              <div className="relative p-4 border-b border-white/10">
                <div className="i-ph:magnifying-glass absolute left-6 top-1/2 transform -translate-y-1/2 text-white/60 text-xl" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search commands..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-white placeholder-white/60 text-lg outline-none"
                />

                {/* Shortcut hint */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <kbd className="px-2 py-1 text-xs bg-white/10 rounded border border-white/20 text-white/60">ESC</kbd>
                </div>
              </div>

              {/* Commands List */}
              <div className="max-h-96 overflow-y-auto modern-scrollbar">
                {filteredCommands.length === 0 ? (
                  <div className="p-6 text-center text-white/60">
                    <div className="i-ph:magnifying-glass text-3xl mb-2" />
                    <p>No commands found</p>
                  </div>
                ) : (
                  categories.map((category) => {
                    const categoryCommands = filteredCommands.filter((cmd) => cmd.category === category);

                    if (categoryCommands.length === 0) {
                      return null;
                    }

                    return (
                      <div key={category} className="p-2">
                        <div className="px-2 py-1 text-xs font-semibold text-white/40 uppercase tracking-wider">
                          {category}
                        </div>
                        {categoryCommands.map((command) => {
                          const globalIndex = filteredCommands.indexOf(command);
                          const isSelected = globalIndex === selectedIndex;

                          return (
                            <motion.button
                              key={command.id}
                              className={classNames(
                                'w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all duration-150',
                                isSelected
                                  ? 'bg-w3j-primary-500/20 text-white border border-w3j-primary-500/30'
                                  : 'text-white/80 hover:bg-white/5 hover:text-white',
                              )}
                              onClick={() => executeCommand(command)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {command.icon && <div className={classNames(command.icon, 'text-xl flex-shrink-0')} />}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">{command.title}</div>
                                {command.description && (
                                  <div className="text-sm text-white/60 truncate">{command.description}</div>
                                )}
                              </div>
                              {isSelected && (
                                <kbd className="px-2 py-1 text-xs bg-white/10 rounded border border-white/20 text-white/60">
                                  ↵
                                </kbd>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-white/10 rounded">↵</kbd> to select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-white/10 rounded">↑↓</kbd> to navigate
                  </span>
                </div>
                <span>W3Jverse Command Palette</span>
              </div>
            </GlassMorphismContainer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  // Global keyboard shortcut
  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    toggle();
  });

  return {
    isOpen,
    open,
    close,
    toggle,
    CommandPalette: (props: Omit<CommandPaletteProps, 'isOpen' | 'onClose'>) => (
      <CommandPalette isOpen={isOpen} onClose={close} {...props} />
    ),
  };
};
