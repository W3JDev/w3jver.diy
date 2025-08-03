import React, { useRef, useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { classNames } from '~/utils/classNames';

interface SynchronizedScrollProps {
  sourceRef: React.RefObject<HTMLElement>;
  targetRef: React.RefObject<HTMLElement>;
  enabled?: boolean;
  direction?: 'vertical' | 'horizontal' | 'both';
  throttle?: number;
  offset?: { x?: number; y?: number };
  className?: string;
}

interface ScrollSyncController {
  enabled: boolean;
  toggle: () => void;
  enable: () => void;
  disable: () => void;
  sync: () => void;
}

export const SynchronizedScroll: React.FC<SynchronizedScrollProps> = ({
  sourceRef,
  targetRef,
  enabled = true,
  direction = 'vertical',
  throttle = 16,
  offset = { x: 0, y: 0 },
  className = ''
}) => {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [isScrolling, setIsScrolling] = useState(false);
  const lastScrollTime = useRef(0);
  const syncingSource = useRef(false);
  const syncingTarget = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  const throttledSync = useCallback(
    (sourceElement: HTMLElement, targetElement: HTMLElement, isSource: boolean) => {
      const now = Date.now();
      if (now - lastScrollTime.current < throttle) return;
      
      lastScrollTime.current = now;

      if (isSource && !syncingTarget.current) {
        syncingSource.current = true;
        
        if (direction === 'vertical' || direction === 'both') {
          const sourceScrollTop = sourceElement.scrollTop;
          const sourceScrollHeight = sourceElement.scrollHeight - sourceElement.clientHeight;
          const targetScrollHeight = targetElement.scrollHeight - targetElement.clientHeight;
          
          if (sourceScrollHeight > 0 && targetScrollHeight > 0) {
            const scrollRatio = sourceScrollTop / sourceScrollHeight;
            targetElement.scrollTop = scrollRatio * targetScrollHeight + (offset.y || 0);
          }
        }
        
        if (direction === 'horizontal' || direction === 'both') {
          const sourceScrollLeft = sourceElement.scrollLeft;
          const sourceScrollWidth = sourceElement.scrollWidth - sourceElement.clientWidth;
          const targetScrollWidth = targetElement.scrollWidth - targetElement.clientWidth;
          
          if (sourceScrollWidth > 0 && targetScrollWidth > 0) {
            const scrollRatio = sourceScrollLeft / sourceScrollWidth;
            targetElement.scrollLeft = scrollRatio * targetScrollWidth + (offset.x || 0);
          }
        }
        
        setTimeout(() => {
          syncingSource.current = false;
        }, 50);
      } else if (!isSource && !syncingSource.current) {
        syncingTarget.current = true;
        
        if (direction === 'vertical' || direction === 'both') {
          const targetScrollTop = targetElement.scrollTop;
          const targetScrollHeight = targetElement.scrollHeight - targetElement.clientHeight;
          const sourceScrollHeight = sourceElement.scrollHeight - sourceElement.clientHeight;
          
          if (targetScrollHeight > 0 && sourceScrollHeight > 0) {
            const scrollRatio = targetScrollTop / targetScrollHeight;
            sourceElement.scrollTop = scrollRatio * sourceScrollHeight - (offset.y || 0);
          }
        }
        
        if (direction === 'horizontal' || direction === 'both') {
          const targetScrollLeft = targetElement.scrollLeft;
          const targetScrollWidth = targetElement.scrollWidth - targetElement.clientWidth;
          const sourceScrollWidth = sourceElement.scrollWidth - sourceElement.clientWidth;
          
          if (targetScrollWidth > 0 && sourceScrollWidth > 0) {
            const scrollRatio = targetScrollLeft / targetScrollWidth;
            sourceElement.scrollLeft = scrollRatio * sourceScrollWidth - (offset.x || 0);
          }
        }
        
        setTimeout(() => {
          syncingTarget.current = false;
        }, 50);
      }
    },
    [direction, throttle, offset]
  );

  const handleSourceScroll = useCallback(() => {
    if (!isEnabled || !sourceRef.current || !targetRef.current) return;
    
    setIsScrolling(true);
    clearTimeout(scrollTimeout.current);
    
    throttledSync(sourceRef.current, targetRef.current, true);
    
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [isEnabled, sourceRef, targetRef, throttledSync]);

  const handleTargetScroll = useCallback(() => {
    if (!isEnabled || !sourceRef.current || !targetRef.current) return;
    
    setIsScrolling(true);
    clearTimeout(scrollTimeout.current);
    
    throttledSync(sourceRef.current, targetRef.current, false);
    
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [isEnabled, sourceRef, targetRef, throttledSync]);

  useEffect(() => {
    const sourceElement = sourceRef.current;
    const targetElement = targetRef.current;

    if (!sourceElement || !targetElement || !isEnabled) return;

    sourceElement.addEventListener('scroll', handleSourceScroll, { passive: true });
    targetElement.addEventListener('scroll', handleTargetScroll, { passive: true });

    return () => {
      sourceElement.removeEventListener('scroll', handleSourceScroll);
      targetElement.removeEventListener('scroll', handleTargetScroll);
    };
  }, [isEnabled, sourceRef, targetRef, handleSourceScroll, handleTargetScroll]);

  const controller: ScrollSyncController = {
    enabled: isEnabled,
    toggle: () => setIsEnabled(prev => !prev),
    enable: () => setIsEnabled(true),
    disable: () => setIsEnabled(false),
    sync: () => {
      if (sourceRef.current && targetRef.current) {
        throttledSync(sourceRef.current, targetRef.current, true);
      }
    }
  };

  return (
    <div className={classNames('relative', className)}>
      {/* Sync indicator */}
      <motion.div
        className={classNames(
          'absolute top-2 right-2 z-10 flex items-center gap-2 px-2 py-1 rounded-lg',
          'bg-black/50 backdrop-blur-sm border border-white/20',
          'transition-opacity duration-300',
          isScrolling ? 'opacity-100' : 'opacity-0'
        )}
        animate={{
          opacity: isScrolling ? 1 : 0,
          scale: isScrolling ? 1 : 0.95
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="w-2 h-2 bg-w3j-primary-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <span className="text-xs text-white font-medium">Syncing</span>
      </motion.div>
    </div>
  );
};

// Hook for managing synchronized scrolling
export const useSynchronizedScroll = (
  initialEnabled = true,
  options?: Omit<SynchronizedScrollProps, 'sourceRef' | 'targetRef'>
) => {
  const sourceRef = useRef<HTMLElement>(null);
  const targetRef = useRef<HTMLElement>(null);
  const [enabled, setEnabled] = useState(initialEnabled);

  const controller: ScrollSyncController = {
    enabled,
    toggle: () => setEnabled(prev => !prev),
    enable: () => setEnabled(true),
    disable: () => setEnabled(false),
    sync: () => {
      if (sourceRef.current && targetRef.current && options) {
        // Manual sync implementation would go here
      }
    }
  };

  return {
    sourceRef,
    targetRef,
    controller,
    SynchronizedScroll: ({ className }: { className?: string }) => (
      <SynchronizedScroll
        sourceRef={sourceRef}
        targetRef={targetRef}
        enabled={enabled}
        className={className}
        {...options}
      />
    )
  };
};

// Component for scroll sync controls
interface ScrollSyncControlsProps {
  controller: ScrollSyncController;
  className?: string;
}

export const ScrollSyncControls: React.FC<ScrollSyncControlsProps> = ({
  controller,
  className = ''
}) => {
  return (
    <div className={classNames('flex items-center gap-2', className)}>
      <button
        onClick={controller.toggle}
        className={classNames(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium',
          'transition-all duration-200',
          controller.enabled
            ? 'bg-w3j-primary-500/20 text-w3j-primary-300 border border-w3j-primary-500/30'
            : 'bg-white/5 text-white/60 border border-white/20 hover:bg-white/10 hover:text-white/80'
        )}
        title={controller.enabled ? 'Disable scroll sync' : 'Enable scroll sync'}
      >
        <div className={classNames(
          controller.enabled ? 'i-ph:arrows-in-simple' : 'i-ph:arrows-out-simple',
          'text-lg'
        )} />
        <span>{controller.enabled ? 'Sync On' : 'Sync Off'}</span>
      </button>
      
      <button
        onClick={controller.sync}
        disabled={!controller.enabled}
        className={classNames(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium',
          'transition-all duration-200',
          controller.enabled
            ? 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10 hover:text-white'
            : 'bg-white/5 text-white/40 border border-white/10 cursor-not-allowed'
        )}
        title="Sync scroll positions now"
      >
        <div className="i-ph:arrows-clockwise text-lg" />
        <span>Sync Now</span>
      </button>
    </div>
  );
};