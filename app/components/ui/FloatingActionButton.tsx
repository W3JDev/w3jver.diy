import React from 'react';
import { motion } from 'framer-motion';
import { GlassMorphismContainer } from './GlassMorphismContainer';
import { classNames } from '~/utils/classNames';

interface FloatingActionButtonProps {
  icon: string;
  onClick: () => void;
  tooltip?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'royal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  badge?: string | number;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onClick,
  tooltip,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  badge
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const variantClasses = {
    primary: 'from-w3j-primary-500 to-w3j-primary-600 hover:from-w3j-primary-400 hover:to-w3j-primary-500',
    secondary: 'from-w3j-secondary-500 to-w3j-secondary-600 hover:from-w3j-secondary-400 hover:to-w3j-secondary-500',
    accent: 'from-w3j-accent-500 to-w3j-accent-600 hover:from-w3j-accent-400 hover:to-w3j-accent-500',
    royal: 'from-w3j-royal-500 to-w3j-royal-600 hover:from-w3j-royal-400 hover:to-w3j-royal-500'
  };

  return (
    <motion.div
      className={classNames('relative', className)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
    >
      <GlassMorphismContainer
        intensity="heavy"
        borderGlow={true}
        shadow={true}
        className={classNames(
          'rounded-full flex items-center justify-center cursor-pointer transition-all duration-300',
          sizeClasses[size],
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-glow'
        )}
        onClick={disabled ? undefined : onClick}
      >
        {/* Gradient Background */}
        <div className={classNames(
          'absolute inset-0 rounded-full bg-gradient-to-br opacity-80 transition-opacity duration-300',
          variantClasses[variant],
          disabled ? 'opacity-30' : 'hover:opacity-90'
        )} />
        
        {/* Icon */}
        <div className={classNames(
          icon,
          iconSizeClasses[size],
          'text-white relative z-10 transition-transform duration-200',
          !disabled ? 'group-hover:scale-110' : ''
        )} />
        
        {/* Badge */}
        {badge && (
          <motion.div
            className={classNames(
              'absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1.5 rounded-full',
              'bg-w3j-accent-500 text-white text-xs font-bold',
              'flex items-center justify-center',
              'shadow-lg border border-white/20'
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          >
            {typeof badge === 'number' && badge > 99 ? '99+' : badge}
          </motion.div>
        )}
        
        {/* Pulse animation for primary actions */}
        {variant === 'primary' && !disabled && (
          <motion.div
            className="absolute inset-0 rounded-full bg-w3j-primary-500/30"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}
      </GlassMorphismContainer>
      
      {/* Tooltip */}
      {tooltip && (
        <div className={classNames(
          'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2',
          'px-2 py-1 bg-black/80 text-white text-xs rounded',
          'opacity-0 pointer-events-none transition-opacity duration-200',
          'group-hover:opacity-100'
        )}>
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45" />
        </div>
      )}
    </motion.div>
  );
};

// Pre-configured FAB variants
export const QuickActionsFAB: React.FC<{ onMenuToggle: () => void; isOpen: boolean }> = ({
  onMenuToggle,
  isOpen
}) => (
  <FloatingActionButton
    icon={isOpen ? "i-ph:x" : "i-ph:plus"}
    onClick={onMenuToggle}
    variant="primary"
    size="lg"
    tooltip={isOpen ? "Close menu" : "Quick actions"}
    className="group"
  />
);

export const VoiceInputFAB: React.FC<{ 
  isListening: boolean;
  onToggle: () => void;
}> = ({ isListening, onToggle }) => (
  <FloatingActionButton
    icon={isListening ? "i-ph:microphone-slash" : "i-ph:microphone"}
    onClick={onToggle}
    variant={isListening ? "accent" : "secondary"}
    size="md"
    tooltip={isListening ? "Stop listening" : "Start voice input"}
  />
);

export const CameraCaptureFAB: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <FloatingActionButton
    icon="i-ph:camera"
    onClick={onClick}
    variant="royal"
    size="md"
    tooltip="Capture screen"
  />
);

export const FileUploadFAB: React.FC<{ onClick: () => void; badge?: number }> = ({ 
  onClick, 
  badge 
}) => (
  <FloatingActionButton
    icon="i-ph:paperclip"
    onClick={onClick}
    variant="secondary"
    size="md"
    tooltip="Upload files"
    badge={badge}
  />
);