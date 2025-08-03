import React from 'react';
import { motion } from 'framer-motion';
import { classNames } from '~/utils/classNames';

interface GlassMorphismContainerProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
  gradient?: boolean;
  shadow?: boolean;
  borderGlow?: boolean;
  onClick?: () => void;
  onHover?: () => void;
}

export const GlassMorphismContainer: React.FC<GlassMorphismContainerProps> = ({
  children,
  className = '',
  intensity = 'medium',
  gradient = false,
  shadow = true,
  borderGlow = false,
  onClick,
  onHover,
}) => {
  const intensityClasses = {
    light: 'backdrop-blur-sm bg-white/5',
    medium: 'backdrop-blur-md bg-white/10',
    heavy: 'backdrop-blur-xl bg-white/15',
  };

  const baseClasses = classNames(
    // Glass morphism base
    'relative overflow-hidden rounded-xl border border-white/20',
    intensityClasses[intensity],

    // Conditional classes
    ...(shadow ? ['shadow-2xl shadow-black/25'] : []),
    ...(borderGlow ? ['ring-1 ring-white/30 ring-opacity-30'] : []),

    // Hover effects
    'transition-all duration-300 ease-out',
    'hover:bg-white/15 hover:border-white/30',
    'hover:shadow-3xl hover:shadow-black/30',

    // Dark mode specific
    'dark:bg-black/20 dark:border-white/10',
    'dark:hover:bg-black/30 dark:hover:border-white/20',

    className,
  );

  const gradientOverlay = gradient && (
    <div className="absolute inset-0 bg-gradient-to-br from-w3j-primary-500/10 via-w3j-secondary-500/10 to-w3j-royal-500/10 pointer-events-none" />
  );

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      className={baseClasses}
      onClick={onClick}
      onHoverStart={onHover}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {gradientOverlay}

      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </Component>
  );
};
