import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useDragControls, type PanInfo } from 'framer-motion';
import { GlassMorphismContainer } from './GlassMorphismContainer';
import { classNames } from '~/utils/classNames';

interface PictureInPictureProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleSize: () => void;
  title?: string;
  src?: string;
  children?: React.ReactNode;
  className?: string;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
}

type PiPSize = 'small' | 'medium' | 'large';

const sizePresets = {
  small: { width: 320, height: 180 },
  medium: { width: 480, height: 270 },
  large: { width: 640, height: 360 }
};

export const PictureInPicture: React.FC<PictureInPictureProps> = ({
  isOpen,
  onClose,
  onToggleSize,
  title = 'Preview',
  src,
  children,
  className = '',
  initialPosition = { x: 20, y: 20 },
  initialSize = sizePresets.medium
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState<PiPSize>('medium');
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentSize = sizePresets[size];

  const cycleSizes = () => {
    const sizes: PiPSize[] = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(size);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setSize(sizes[nextIndex]);
    onToggleSize();
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: Event, info: PanInfo) => {
    setIsDragging(false);
    setPosition({ x: info.point.x, y: info.point.y });
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Space' && e.ctrlKey) {
        e.preventDefault();
        cycleSizes();
      } else if (e.key === 'm' && e.ctrlKey) {
        e.preventDefault();
        toggleMinimize();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-50">
      <motion.div
        ref={contentRef}
        drag
        dragControls={dragControls}
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={classNames(
          'fixed pointer-events-auto cursor-move',
          'transition-shadow duration-300',
          isDragging ? 'shadow-2xl' : 'shadow-xl',
          className
        )}
        style={{
          x: position.x,
          y: position.y,
          width: currentSize.width,
          height: isMinimized ? 40 : currentSize.height,
        }}
        animate={{
          width: currentSize.width,
          height: isMinimized ? 40 : currentSize.height,
          opacity: 1,
          scale: 1,
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        initial={{ opacity: 0, scale: 0.8 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        <GlassMorphismContainer
          intensity="heavy"
          gradient={true}
          shadow={true}
          borderGlow={isDragging}
          className="h-full flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div
            className={classNames(
              'flex items-center justify-between px-3 py-2 cursor-move',
              'border-b border-white/10',
              'bg-gradient-to-r from-w3j-primary-500/20 to-w3j-secondary-500/20'
            )}
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="i-ph:picture-in-picture text-sm text-white/80" />
              <span className="text-sm font-medium text-white truncate">{title}</span>
              <div className={classNames(
                'px-1.5 py-0.5 rounded text-xs font-medium',
                'bg-white/10 text-white/70'
              )}>
                {size.toUpperCase()}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Minimize button */}
              <button
                onClick={toggleMinimize}
                className={classNames(
                  'w-6 h-6 rounded flex items-center justify-center',
                  'hover:bg-white/10 transition-colors',
                  'text-white/70 hover:text-white'
                )}
                title={isMinimized ? 'Restore' : 'Minimize'}
              >
                <div className={isMinimized ? 'i-ph:caret-up' : 'i-ph:minus'} />
              </button>
              
              {/* Resize button */}
              <button
                onClick={cycleSizes}
                className={classNames(
                  'w-6 h-6 rounded flex items-center justify-center',
                  'hover:bg-white/10 transition-colors',
                  'text-white/70 hover:text-white'
                )}
                title="Cycle size (Ctrl+Space)"
              >
                <div className="i-ph:arrows-out" />
              </button>
              
              {/* Close button */}
              <button
                onClick={onClose}
                className={classNames(
                  'w-6 h-6 rounded flex items-center justify-center',
                  'hover:bg-red-500/20 transition-colors',
                  'text-white/70 hover:text-red-300'
                )}
                title="Close (Esc)"
              >
                <div className="i-ph:x" />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <motion.div
              className="flex-1 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {src ? (
                <iframe
                  src={src}
                  className="w-full h-full border-0"
                  title={title}
                  allow="accelerometer; autoplay; camera; encrypted-media; fullscreen; gyroscope; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                  sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                />
              ) : (
                <div className="w-full h-full">
                  {children}
                </div>
              )}
            </motion.div>
          )}

          {/* Resize handle */}
          {!isMinimized && (
            <div
              className={classNames(
                'absolute bottom-0 right-0 w-4 h-4',
                'cursor-se-resize',
                'bg-gradient-to-tl from-white/20 to-transparent',
                'hover:from-w3j-primary-500/30'
              )}
              onPointerDown={(e) => {
                e.stopPropagation();
                setIsResizing(true);
              }}
            >
              <div className="absolute bottom-1 right-1 w-2 h-2">
                <div className="absolute bottom-0 right-0 w-1 h-1 bg-white/60 rounded-full" />
                <div className="absolute bottom-0 right-2 w-1 h-1 bg-white/40 rounded-full" />
                <div className="absolute bottom-2 right-0 w-1 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
          )}

          {/* Snap zones indicator */}
          {isDragging && (
            <motion.div
              className="fixed inset-0 pointer-events-none z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Corner snap zones */}
              {[
                { position: 'top-4 left-4', label: 'Top Left' },
                { position: 'top-4 right-4', label: 'Top Right' },
                { position: 'bottom-4 left-4', label: 'Bottom Left' },
                { position: 'bottom-4 right-4', label: 'Bottom Right' }
              ].map(({ position, label }) => (
                <div
                  key={label}
                  className={classNames(
                    'absolute w-24 h-16 rounded-lg border-2 border-dashed border-w3j-primary-500/50',
                    'bg-w3j-primary-500/10',
                    position
                  )}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-w3j-primary-300 font-medium">{label}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </GlassMorphismContainer>
      </motion.div>
    </div>
  );
};

export const usePictureInPicture = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pipProps, setPipProps] = useState<Partial<PictureInPictureProps>>({});

  const open = useCallback((props?: Partial<PictureInPictureProps>) => {
    setPipProps(props || {});
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    PictureInPicture: (props: Omit<PictureInPictureProps, 'isOpen' | 'onClose'>) => (
      <PictureInPicture
        isOpen={isOpen}
        onClose={close}
        {...pipProps}
        {...props}
      />
    ),
  };
};