'use client';
import { useEffect, useRef } from 'react';

export default function LoginBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // Floating glowing orbs
    const orbs = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 180 + Math.random() * 200,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      hue: [250, 260, 170, 200, 220, 280][i],
      alpha: 0.12 + Math.random() * 0.1,
    }));

    // Floating particles
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 1 + Math.random() * 2,
      dx: (Math.random() - 0.5) * 0.3,
      dy: -0.2 - Math.random() * 0.4,
      alpha: 0.2 + Math.random() * 0.5,
    }));

    // Grid dots
    const gridSpacing = 40;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Deep gradient base
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#0a0818');
      bg.addColorStop(0.5, '#0d1124');
      bg.addColorStop(1, '#080d1a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Grid dots
      ctx.fillStyle = 'rgba(130, 120, 255, 0.07)';
      for (let x = 0; x < W; x += gridSpacing) {
        for (let y = 0; y < H; y += gridSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Glowing orbs
      orbs.forEach(orb => {
        orb.x += orb.dx;
        orb.y += orb.dy;
        if (orb.x < -orb.r) orb.x = W + orb.r;
        if (orb.x > W + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y = H + orb.r;
        if (orb.y > H + orb.r) orb.y = -orb.r;

        const grad = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, orb.r
        );
        grad.addColorStop(0, `hsla(${orb.hue}, 80%, 65%, ${orb.alpha})`);
        grad.addColorStop(1, `hsla(${orb.hue}, 80%, 65%, 0)`);
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Floating particles
      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160, 150, 255, ${p.alpha})`;
        ctx.fill();
      });

      // Shooting lines
      ctx.strokeStyle = 'rgba(120, 200, 180, 0.04)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * W, 0);
        ctx.lineTo(Math.random() * W, H);
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
