import React from 'react';
import { cn } from '@/lib/utils';

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  /** optional delay in ms for staggered entry */
  delay?: number;
};

export default function GlassCard({ children, className = '', delay }: GlassCardProps) {
  const delayStyle = delay ? { animationDelay: `${delay}ms` } : {};
  return (
    <div
      className={cn('glass-card glass animate-fadeUp', className)}
      style={delayStyle as React.CSSProperties}
    >
      {children}
    </div>
  );
}
