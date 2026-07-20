'use client';
import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  delay?: number;
  direction?: 'up'|'left'|'right'|'scale';
  className?: string;
  threshold?: number;
}

export default function ScrollReveal({
  children, delay=0, direction='up',
  className='', threshold=0.15,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const transforms: Record<string,string> = {
      up:    'translateY(32px)',
      left:  'translateX(-40px)',
      right: 'translateX(40px)',
      scale: 'scale(0.88)',
    };

    el.style.opacity = '0';
    el.style.transform = transforms[direction];
    el.style.transition =
      `opacity 0.65s ease ${delay}ms, ` +
      `transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms`;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'none';
          obs.disconnect();
        }
      },
      { threshold }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, direction, threshold]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
