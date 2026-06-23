'use client';
import { useEffect, useRef } from 'react';

export function useMouseParallax(strength = 0.02) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Disable on touch devices
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      return;
    }

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      el.style.transform =
        `perspective(800px) rotateY(${dx}deg) rotateX(${-dy}deg)`;
    };

    const handleLeave = () => {
      el.style.transform = 'perspective(800px) rotateY(0) rotateX(0)';
      el.style.transition = 'transform 0.5s ease';
    };

    const handleEnter = () => {
      el.style.transition = 'transform 0.1s ease';
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    el.addEventListener('mouseenter', handleEnter);

    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
      el.removeEventListener('mouseenter', handleEnter);
    };
  }, [strength]);

  return ref;
}
