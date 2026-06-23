'use client';
import { useEffect, useRef } from 'react';

export default function HeroCanvas3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let animId: number;
    let t = 0;
    let mouseX = W / 2;
    let mouseY = H / 2;

    canvas.width = W;
    canvas.height = H;

    // Responsive particle count for mobile
    const isMobile = W < 768;
    const numParticles = isMobile ? 40 : 120;

    // 3D floating particles
    const particles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      z: Math.random() * 1000,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      vz: (Math.random() - 0.5) * 1.5,
      r: 1 + Math.random() * 2,
      hue: Math.random() > 0.5 ? 250 : 165,
      alpha: 0.3 + Math.random() * 0.5,
    }));

    // 3D geometric shapes (floating books, graduation caps, stars)
    const shapes = Array.from({ length: 8 }, (_, i) => ({
      x: (Math.random() * 0.8 + 0.1) * W,
      y: (Math.random() * 0.8 + 0.1) * H,
      z: 200 + Math.random() * 400,
      rotX: Math.random() * Math.PI * 2,
      rotY: Math.random() * Math.PI * 2,
      rotZ: Math.random() * Math.PI * 2,
      rotSpeedX: (Math.random() - 0.5) * 0.008,
      rotSpeedY: (Math.random() - 0.5) * 0.01,
      rotSpeedZ: (Math.random() - 0.5) * 0.006,
      size: 20 + Math.random() * 30,
      type: i % 4,
      hue: [250, 165, 210, 45][i % 4],
      floatOffset: Math.random() * Math.PI * 2,
    }));

    // Neural network nodes (representing AI)
    const nodes = Array.from({ length: 20 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 3 + Math.random() * 4,
      alpha: 0.4 + Math.random() * 0.4,
    }));

    // Orbiting rings (3D perspective)
    const rings = Array.from({ length: 3 }, (_, i) => ({
      cx: W * [0.2, 0.8, 0.5][i],
      cy: H * [0.3, 0.7, 0.5][i],
      rx: 80 + i * 40,
      ry: 30 + i * 15,
      rotation: (i * Math.PI * 2) / 3,
      speed: 0.003 + i * 0.002,
      hue: [250, 165, 45][i],
    }));

    const project3D = (x: number, y: number, z: number) => {
      const fov = 500;
      const scale = fov / (fov + z);
      const cx = W / 2;
      const cy = H / 2;
      // Mouse parallax effect
      const mx = (mouseX - cx) * 0.05;
      const my = (mouseY - cy) * 0.05;
      return {
        sx: (x - cx + mx) * scale + cx,
        sy: (y - cy + my) * scale + cy,
        scale,
      };
    };

    const draw3DShape = (
      ctx: CanvasRenderingContext2D,
      shape: typeof shapes[0]
    ) => {
      shape.rotX += shape.rotSpeedX;
      shape.rotY += shape.rotSpeedY;
      shape.rotZ += shape.rotSpeedZ;

      const floatY = Math.sin(t * 0.005 + shape.floatOffset) * 15;
      const { sx, sy, scale } = project3D(
        shape.x, shape.y + floatY, shape.z
      );
      const s = shape.size * scale;
      const alpha = 0.15 + scale * 0.25;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(shape.rotZ);

      if (shape.type === 0) {
        // 3D Cube (college building)
        const cos = Math.cos(shape.rotY) * s * 0.5;
        const sin = Math.sin(shape.rotY) * s * 0.3;
        // Front face
        ctx.fillStyle = `hsla(${shape.hue},70%,65%,${alpha})`;
        ctx.strokeStyle = `hsla(${shape.hue},70%,80%,${alpha * 1.5})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.rect(-s/2, -s/2, s, s);
        ctx.fill();
        ctx.stroke();
        // Top face (3D effect)
        ctx.fillStyle = `hsla(${shape.hue},70%,75%,${alpha * 0.8})`;
        ctx.beginPath();
        ctx.moveTo(-s/2, -s/2);
        ctx.lineTo(-s/2 + cos, -s/2 - sin);
        ctx.lineTo(s/2 + cos, -s/2 - sin);
        ctx.lineTo(s/2, -s/2);
        ctx.fill();
        ctx.stroke();
        // Right face
        ctx.fillStyle = `hsla(${shape.hue},70%,55%,${alpha * 0.9})`;
        ctx.beginPath();
        ctx.moveTo(s/2, -s/2);
        ctx.lineTo(s/2 + cos, -s/2 - sin);
        ctx.lineTo(s/2 + cos, s/2 - sin);
        ctx.lineTo(s/2, s/2);
        ctx.fill();
        ctx.stroke();
      } else if (shape.type === 1) {
        // Graduation cap (flat with 3D tilt)
        const tilt = Math.sin(shape.rotX) * 0.3;
        ctx.transform(1, tilt, 0, 1 - Math.abs(tilt) * 0.2, 0, 0);
        // Board
        ctx.fillStyle = `hsla(${shape.hue},70%,65%,${alpha})`;
        ctx.fillRect(-s/2, -s/4, s, s/2);
        // Top tassel
        ctx.beginPath();
        ctx.arc(0, -s/4, s/6, 0, Math.PI * 2);
        ctx.fill();
        // Tassel line
        ctx.strokeStyle = `hsla(45,90%,65%,${alpha * 1.5})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s/3, -s/4);
        ctx.lineTo(s/3, s/4);
        ctx.stroke();
      } else if (shape.type === 2) {
        // DNA helix (representing science/research)
        for (let i = 0; i < 8; i++) {
          const angle1 = (i / 8) * Math.PI * 2 + shape.rotY;
          const angle2 = angle1 + Math.PI;
          const yOff = (i / 8 - 0.5) * s * 1.5;
          const r1 = s * 0.3 * Math.cos(angle1);
          const r2 = s * 0.3 * Math.cos(angle2);
          ctx.beginPath();
          ctx.arc(r1, yOff, 3 * scale, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${shape.hue},80%,70%,${alpha})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(r2, yOff, 3 * scale, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${shape.hue + 30},80%,70%,${alpha})`;
          ctx.fill();
          if (i < 7) {
            ctx.strokeStyle = `hsla(${shape.hue},60%,65%,${alpha * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(r1, yOff);
            ctx.lineTo(r2, yOff);
            ctx.stroke();
          }
        }
      } else {
        // Star / spark (scholarship)
        const spikes = 6;
        const outerR = s * 0.5;
        const innerR = s * 0.25;
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const angle = (i * Math.PI) / spikes;
          const r = i % 2 === 0 ? outerR : innerR;
          const px = Math.cos(angle + shape.rotZ) * r;
          const py = Math.sin(angle + shape.rotZ) * r;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = `hsla(${shape.hue},90%,70%,${alpha})`;
        ctx.fill();
        // Glow
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, outerR);
        grd.addColorStop(0, `hsla(${shape.hue},90%,80%,${alpha})`);
        grd.addColorStop(1, `hsla(${shape.hue},90%,80%,0)`);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      ctx.restore();
    };

    const drawNeuralConnections = () => {
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });

      // Draw connections
      nodes.forEach((n1, i) => {
        nodes.forEach((n2, j) => {
          if (j <= i) return;
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.12;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(127,119,221,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
        // Draw node
        ctx.beginPath();
        ctx.arc(n1.x, n1.y, n1.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(127,119,221,${n1.alpha * 0.4})`;
        ctx.fill();
      });
    };

    const drawOrbitalRings = () => {
      rings.forEach(ring => {
        ring.rotation += ring.speed;
        ctx.save();
        ctx.translate(ring.cx, ring.cy);

        // Elliptical ring (3D orbital effect)
        ctx.beginPath();
        ctx.ellipse(0, 0, ring.rx, ring.ry, ring.rotation, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${ring.hue},70%,65%,0.08)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Orbiting dot on the ring
        const dotAngle = ring.rotation * 3;
        const dotX = Math.cos(dotAngle) * ring.rx;
        const dotY = Math.sin(dotAngle) * ring.ry;
        const dotGrd = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 6);
        dotGrd.addColorStop(0, `hsla(${ring.hue},80%,70%,0.6)`);
        dotGrd.addColorStop(1, `hsla(${ring.hue},80%,70%,0)`);
        ctx.beginPath();
        ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
        ctx.fillStyle = dotGrd;
        ctx.fill();

        ctx.restore();
      });
    };

    const drawParticles = () => {
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        if (p.z < 0) p.z = 1000;
        if (p.z > 1000) p.z = 0;

        const { sx, sy, scale } = project3D(p.x, p.y, p.z);
        const r = p.r * scale;
        const alpha = p.alpha * scale;

        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(r, 0.3), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},70%,70%,${alpha})`;
        ctx.fill();
      });
    };

    // Scrolling text ribbons (India education stats)
    const stats = [
      '14L+ TNEA Students 2026',
      '13L+ JEE Registrations',
      '500+ Colleges Matched',
      'Free AI Counselling',
      'Scholarship Finder',
      'Stream Discovery AI',
    ];
    let ribbonOffset = 0;

    const drawRibbon = () => {
      ribbonOffset -= 0.5;
      const ribbonText = stats.join('   ✦   ');
      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      const textW = ctx.measureText(ribbonText).width;
      if (ribbonOffset < -textW) ribbonOffset = 0;

      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = '#7F77DD';
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(ribbonText, ribbonOffset, H - 20);
      ctx.fillText(ribbonText, ribbonOffset + textW + 100, H - 20);
      ctx.restore();
    };

    const frame = () => {
      t++;

      // Dark background gradient
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#05071a');
      bg.addColorStop(0.4, '#080d24');
      bg.addColorStop(1, '#050a1e');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      drawNeuralConnections();
      drawOrbitalRings();
      drawParticles();
      shapes.forEach(s => draw3DShape(ctx, s));
      drawRibbon();

      animId = requestAnimationFrame(frame);
    };

    frame();

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    // Pause when hidden
    const handleVisibility = () => {
      if (document.hidden) cancelAnimationFrame(animId);
      else {
          cancelAnimationFrame(animId);
          frame();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', handleVisibility);
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
        willChange: 'transform'
      }}
    />
  );
}
