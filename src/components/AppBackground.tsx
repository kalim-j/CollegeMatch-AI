'use client';
import { useEffect, useRef } from 'react';

export default function AppBackground() {
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

    let t = 0;

    // Dark ambient blobs
    const blobs = [
      { x: W * 0.1, y: H * 0.2, r: 600, hue: 250, speed: 0.0004 }, // Indigo
      { x: W * 0.8, y: H * 0.1, r: 500, hue: 170, speed: 0.0003 }, // Teal
      { x: W * 0.5, y: H * 0.7, r: 550, hue: 230, speed: 0.0005 }, // Purpleish
      { x: W * 0.9, y: H * 0.8, r: 400, hue: 260, speed: 0.0002 }, // Violet
    ];

    // Cinematic particles
    const dots = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      baseY: 0,
      r: 0.5 + Math.random() * 1.5,
      speed: 0.0002 + Math.random() * 0.0005,
      offset: Math.random() * Math.PI * 2,
      alpha: 0.1 + Math.random() * 0.3,
      hue: Math.random() > 0.5 ? 250 : 170,
    })).map(d => ({ ...d, baseY: d.y }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t++;

      // Deep Space Base
      ctx.fillStyle = '#05071a';
      ctx.fillRect(0, 0, W, H);

      // Ambient Glows
      blobs.forEach((blob, i) => {
        const bx = blob.x + Math.sin(t * blob.speed + i) * 120;
        const by = blob.y + Math.cos(t * blob.speed * 0.8 + i) * 90;

        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, blob.r);
        grad.addColorStop(0, `hsla(${blob.hue}, 60%, 40%, 0.08)`);
        grad.addColorStop(1, `hsla(${blob.hue}, 60%, 40%, 0)`);
        
        ctx.globalCompositeOperation = 'screen';
        ctx.beginPath();
        ctx.arc(bx, by, blob.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Reset composite for particles
      ctx.globalCompositeOperation = 'source-over';

      // Floating particles
      dots.forEach(dot => {
        const y = dot.baseY + Math.sin(t * dot.speed + dot.offset) * 20;
        ctx.beginPath();
        ctx.arc(dot.x, y, dot.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${dot.hue}, 70%, 70%, ${dot.alpha})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = `hsla(${dot.hue}, 70%, 70%, 0.5)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Subtle Cyber Grid
      ctx.strokeStyle = 'rgba(127, 119, 221, 0.03)';
      ctx.lineWidth = 0.5;
      const gridSize = 80;
      
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
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
      className="fixed inset-0 w-screen h-screen -z-10 pointer-events-none"
    />
  );
}
