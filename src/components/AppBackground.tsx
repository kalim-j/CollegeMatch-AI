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

    // Soft floating blobs
    const blobs = [
      { x: W * 0.1, y: H * 0.2, r: 300, hue: 250, speed: 0.0008 },
      { x: W * 0.8, y: H * 0.1, r: 250, hue: 170, speed: 0.0006 },
      { x: W * 0.5, y: H * 0.7, r: 280, hue: 220, speed: 0.0010 },
      { x: W * 0.9, y: H * 0.8, r: 200, hue: 260, speed: 0.0007 },
    ];

    // Small floating dots
    const dots = Array.from({ length: 40 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      baseY: 0,
      r: 1.5 + Math.random() * 2.5,
      speed: 0.0005 + Math.random() * 0.001,
      offset: Math.random() * Math.PI * 2,
      alpha: 0.15 + Math.random() * 0.25,
      hue: Math.random() > 0.5 ? 250 : 170,
    })).map(d => ({ ...d, baseY: d.y }));

    // Curved wave lines
    const waves = Array.from({ length: 3 }, (_, i) => ({
      amplitude: 30 + i * 20,
      frequency: 0.003 + i * 0.001,
      speed: 0.0008 + i * 0.0003,
      yBase: H * (0.3 + i * 0.2),
      alpha: 0.04 - i * 0.01,
      hue: 250 + i * 20,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t++;

      // Light warm base
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#f8f7ff');
      bg.addColorStop(0.5, '#f3f1fe');
      bg.addColorStop(1, '#eef8f4');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Soft blobs
      blobs.forEach((blob, i) => {
        const bx = blob.x + Math.sin(t * blob.speed + i) * 80;
        const by = blob.y + Math.cos(t * blob.speed * 0.7 + i) * 60;

        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, blob.r);
        grad.addColorStop(0, `hsla(${blob.hue}, 70%, 75%, 0.18)`);
        grad.addColorStop(1, `hsla(${blob.hue}, 70%, 75%, 0)`);
        ctx.beginPath();
        ctx.arc(bx, by, blob.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Wave lines
      waves.forEach(wave => {
        ctx.beginPath();
        ctx.moveTo(0, wave.yBase);
        for (let x = 0; x <= W; x += 4) {
          const y = wave.yBase +
            Math.sin(x * wave.frequency + t * wave.speed) * wave.amplitude;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsla(${wave.hue}, 60%, 60%, ${wave.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Floating dots
      dots.forEach(dot => {
        const y = dot.baseY + Math.sin(t * dot.speed + dot.offset) * 15;
        ctx.beginPath();
        ctx.arc(dot.x, y, dot.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${dot.hue}, 60%, 55%, ${dot.alpha})`;
        ctx.fill();
      });

      // Subtle grid
      ctx.strokeStyle = 'rgba(127, 119, 221, 0.04)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 60) {
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
