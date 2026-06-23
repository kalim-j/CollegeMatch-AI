'use client';
import { useEffect, useRef, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'scale' | 'rotate3d';
  className?: string;
}

export default function ScrollReveal3D({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const initialStyles: Record<string, string> = {
      opacity: '0',
      transition: `all 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
    };

    const transforms: Record<string, string> = {
      up: 'translateY(40px) rotateX(8deg)',
      left: 'translateX(-60px) rotateY(-10deg)',
      right: 'translateX(60px) rotateY(10deg)',
      scale: 'scale(0.85) rotateX(5deg)',
      rotate3d: 'rotate3d(1,1,0,15deg) scale(0.9)',
    };

    el.style.opacity = '0';
    el.style.transform = transforms[direction];
    el.style.transition = initialStyles.transition;
    el.style.transformStyle = 'preserve-3d';
    el.style.willChange = 'transform, opacity';

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'none';
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, direction]);

  return (
    <div ref={ref} className={className} style={{ perspective: '1000px' }}>
      {children}
    </div>
  );
}
