'use client';
import { motion } from 'framer-motion';

interface Button3DProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit' | 'reset';
}

export default function Button3D({
  children,
  onClick,
  disabled,
  className = '',
  variant = 'primary',
  type = 'button',
}: Button3DProps) {
  const variants = {
    primary:
      'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-300/50',
    secondary:
      'bg-white/70 backdrop-blur border-2 border-purple-200 text-purple-700',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-6 py-3 rounded-xl font-bold transition-colors
        ${variants[variant]}
        ${className}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17,
      }}
      style={{
        perspective: 1000,
      }}
    >
      <motion.div
        style={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </motion.div>

      {/* 3D shadow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
        whileHover={{ opacity: 1 }}
      />
    </motion.button>
  );
}
