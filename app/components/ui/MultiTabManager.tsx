import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { GlassMorphismContainer } from './GlassMorphismContainer';
import { classNames } from '~/utils/classNames';

interface Tab {
  id: string;
  title: string;
  url?: string;
  isActive: boolean;
  isModified: boolean;
  favicon?: string;
  metadata?: {
    project?: string;
    branch?: string;
    lastModified?: Date;
  };
}

interface MultiTabManagerProps {
  tabs: Tab[];
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabAdd: () => void;
  onTabReorder?: (fromIndex: number, toIndex: number) => void;
  onTabDuplicate?: (tabId: string) => void;
  maxTabs?: number;
  className?: string;
}

export const MultiTabManager: React.FC<MultiTabManagerProps> = ({
  tabs,
  onTabSelect,
  onTabClose,
  onTabAdd,
  onTabReorder,
  onTabDuplicate,
  maxTabs = 10,
  className = ''
}) => {
  const [draggedTab, setDraggedTab] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ tabId: string; x: number; y: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeTab = tabs.find(tab => tab.isActive);
  const canAddTab = tabs.length < maxTabs;

  const handleTabClick = (tabId: string, event: React.MouseEvent) => {
    if (event.button === 1) { // Middle click
      onTabClose(tabId);
    } else {
      onTabSelect(tabId);
    }
  };

  const handleTabDoubleClick = (tabId: string) => {
    if (onTabDuplicate) {
      onTabDuplicate(tabId);
    }
  };

  const handleContextMenu = (tabId: string, event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      tabId,
      x: event.clientX,
      y: event.clientY
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleDragStart = (tabId: string) => {
    setDraggedTab(tabId);
  };

  const handleDragEnd = () => {
    setDraggedTab(null);
    setDropTarget(null);
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedTab && onTabReorder) {
      const sourceIndex = tabs.findIndex(tab => tab.id === draggedTab);
      if (sourceIndex !== targetIndex) {
        onTabReorder(sourceIndex, targetIndex);
      }
    }
    handleDragEnd();
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => closeContextMenu();
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 't') {
          e.preventDefault();
          if (canAddTab) onTabAdd();
        } else if (e.key === 'w') {
          e.preventDefault();
          if (activeTab) onTabClose(activeTab.id);
        } else if (e.key === 'Tab') {
          e.preventDefault();
          const currentIndex = tabs.findIndex(tab => tab.isActive);
          const nextIndex = e.shiftKey 
            ? (currentIndex - 1 + tabs.length) % tabs.length
            : (currentIndex + 1) % tabs.length;
          onTabSelect(tabs[nextIndex].id);
        } else if (e.key >= '1' && e.key <= '9') {
          e.preventDefault();
          const index = parseInt(e.key) - 1;
          if (tabs[index]) {
            onTabSelect(tabs[index].id);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTab, canAddTab, onTabAdd, onTabClose, onTabSelect]);

  return (
    <div className={classNames('relative', className)}>
      <GlassMorphismContainer
        intensity="medium"
        className="flex items-center gap-1 p-1"
      >
        {/* Tab list */}
        <div
          ref={scrollRef}
          className="flex-1 flex items-center gap-1 overflow-x-auto modern-scrollbar-horizontal"
          style={{ scrollbarWidth: 'thin' }}
        >
          <AnimatePresence mode="popLayout">
            {tabs.map((tab, index) => (
              <motion.div
                key={tab.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragStart={() => handleDragStart(tab.id)}
                onDragEnd={handleDragEnd}
                className={classNames(
                  'relative flex items-center gap-2 px-3 py-2 rounded-lg min-w-0 max-w-[200px]',
                  'transition-all duration-200 cursor-pointer group',
                  'border border-transparent',
                  tab.isActive
                    ? 'bg-w3j-primary-500/20 border-w3j-primary-500/30 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white',
                  draggedTab === tab.id ? 'opacity-50 scale-95' : ''
                )}
                onClick={(e) => handleTabClick(tab.id, e)}
                onDoubleClick={() => handleTabDoubleClick(tab.id)}
                onContextMenu={(e) => handleContextMenu(tab.id, e)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDropTarget(index);
                }}
                onDrop={() => handleDrop(index)}
              >
                {/* Favicon */}
                {tab.favicon ? (
                  <img
                    src={tab.favicon}
                    alt=""
                    className="w-4 h-4 flex-shrink-0"
                  />
                ) : (
                  <div className="i-ph:file text-sm flex-shrink-0" />
                )}

                {/* Title */}
                <span className="truncate text-sm font-medium flex-1">
                  {tab.title}
                </span>

                {/* Modified indicator */}
                {tab.isModified && (
                  <div className="w-2 h-2 rounded-full bg-w3j-accent-500 flex-shrink-0" />
                )}

                {/* Close button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab.id);
                  }}
                  className={classNames(
                    'w-4 h-4 rounded flex items-center justify-center flex-shrink-0',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    'hover:bg-red-500/20 hover:text-red-300'
                  )}
                >
                  <div className="i-ph:x text-xs" />
                </button>

                {/* Drop indicator */}
                {dropTarget === index && draggedTab && draggedTab !== tab.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-w3j-primary-500" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add tab button */}
        {canAddTab && (
          <button
            onClick={onTabAdd}
            className={classNames(
              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
              'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white',
              'transition-all duration-200'
            )}
            title="New tab (Ctrl+T)"
          >
            <div className="i-ph:plus text-lg" />
          </button>
        )}

        {/* Tab overflow indicator */}
        {tabs.length >= maxTabs && (
          <div
            className={classNames(
              'px-2 py-1 rounded text-xs font-medium flex-shrink-0',
              'bg-w3j-accent-500/20 text-w3j-accent-300'
            )}
          >
            Max
          </div>
        )}
      </GlassMorphismContainer>

      {/* Context menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <GlassMorphismContainer
              intensity="heavy"
              className="py-2 min-w-[160px]"
            >
              <div className="flex flex-col">
                <button
                  onClick={() => {
                    if (onTabDuplicate) onTabDuplicate(contextMenu.tabId);
                    closeContextMenu();
                  }}
                  className="px-3 py-2 text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="i-ph:copy" />
                    Duplicate Tab
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    onTabClose(contextMenu.tabId);
                    closeContextMenu();
                  }}
                  className="px-3 py-2 text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="i-ph:x" />
                    Close Tab
                  </div>
                </button>
                
                <hr className="my-1 border-white/10" />
                
                <button
                  onClick={() => {
                    tabs.forEach(tab => {
                      if (tab.id !== contextMenu.tabId) {
                        onTabClose(tab.id);
                      }
                    });
                    closeContextMenu();
                  }}
                  className="px-3 py-2 text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="i-ph:x-circle" />
                    Close Others
                  </div>
                </button>
              </div>
            </GlassMorphismContainer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab info panel */}
      {activeTab?.metadata && (
        <motion.div
          className="mt-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassMorphismContainer intensity="light" className="px-3 py-2">
            <div className="flex items-center gap-4 text-xs text-white/70">
              {activeTab.metadata.project && (
                <div className="flex items-center gap-1">
                  <div className="i-ph:folder" />
                  <span>{activeTab.metadata.project}</span>
                </div>
              )}
              {activeTab.metadata.branch && (
                <div className="flex items-center gap-1">
                  <div className="i-ph:git-branch" />
                  <span>{activeTab.metadata.branch}</span>
                </div>
              )}
              {activeTab.metadata.lastModified && (
                <div className="flex items-center gap-1">
                  <div className="i-ph:clock" />
                  <span>{activeTab.metadata.lastModified.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </GlassMorphismContainer>
        </motion.div>
      )}
    </div>
  );
};

export const useMultiTabManager = (initialTabs: Tab[] = []) => {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);

  const addTab = useCallback((newTab: Omit<Tab, 'isActive'>) => {
    setTabs(prev => [
      ...prev.map(tab => ({ ...tab, isActive: false })),
      { ...newTab, isActive: true }
    ]);
  }, []);

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== tabId);
      if (filtered.length === 0) return filtered;

      // If we closed the active tab, activate the next one
      const wasActive = prev.find(tab => tab.id === tabId)?.isActive;
      if (wasActive) {
        const activeIndex = prev.findIndex(tab => tab.id === tabId);
        const nextIndex = Math.min(activeIndex, filtered.length - 1);
        filtered[nextIndex].isActive = true;
      }

      return filtered;
    });
  }, []);

  const selectTab = useCallback((tabId: string) => {
    setTabs(prev => prev.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    })));
  }, []);

  const duplicateTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const tab = prev.find(t => t.id === tabId);
      if (!tab) return prev;

      const newTab: Tab = {
        ...tab,
        id: `${tab.id}-copy-${Date.now()}`,
        title: `${tab.title} (Copy)`,
        isActive: true
      };

      return [
        ...prev.map(t => ({ ...t, isActive: false })),
        newTab
      ];
    });
  }, []);

  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setTabs(prev => {
      const newTabs = [...prev];
      const [movedTab] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, movedTab);
      return newTabs;
    });
  }, []);

  const updateTab = useCallback((tabId: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, ...updates } : tab
    ));
  }, []);

  return {
    tabs,
    addTab,
    closeTab,
    selectTab,
    duplicateTab,
    reorderTabs,
    updateTab,
    setTabs
  };
};