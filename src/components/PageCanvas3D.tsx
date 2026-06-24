'use client';
import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

export default function PageCanvas3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      time += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const currentTheme = theme === 'system' ? systemTheme : theme;
      const isDark = currentTheme === 'dark';
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      ctx.strokeStyle = isDark ? 'rgba(127, 119, 221, 0.05)' : 'rgba(127, 119, 221, 0.15)';
      ctx.lineWidth = 1;

      // 3D Grid projection
      ctx.beginPath();
      for (let i = -20; i <= 20; i++) {
        const x = i * 60;
        for (let j = -20; j <= 20; j++) {
          const z = j * 60 + (time * 100) % 60;
          const scale = 500 / (500 + z);
          if (scale < 0) continue;
          
          const px = cx + x * scale;
          const py = cy + 200 * scale; // floor level

          if (i === -20) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, systemTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 opacity-50"
    />
  );
}
