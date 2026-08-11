import React from 'react';
import { motion } from 'motion/react';
import Logo from './Logo';

interface WaackOnLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact' | 'text-only';
  mode?: 'default' | 'bw-light' | 'bw-dark';
}

export const WaackOnLogo: React.FC<WaackOnLogoProps> = ({ 
  className = '', 
  size = 'md',
  variant,
  mode
}) => {
  const widthMap = {
    sm: 'w-28',
    md: 'w-40',
    lg: 'w-56',
    xl: 'w-72 md:w-80'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`inline-flex items-center justify-center relative select-none ${className}`}
      title="Waack On Academy - Logo Oficial 3D"
    >
      <div className={`${widthMap[size]} h-auto`}>
        <Logo variant={variant} mode={mode} />
      </div>
    </motion.div>
  );
};

