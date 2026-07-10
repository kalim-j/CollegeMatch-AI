'use client';
import { useEffect, useRef } from 'react';

export default function HeroCanvas3D() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let animId: number;
    let t = 0;
    let mouseX = W / 2;
    let mouseY = H / 2;

    const setSize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    setSize();
    canvas.style.display = 'block';

    /* ── 3D particles ── */
    const isMobile = W < 768;
    const count = isMobile ? 50 : 120;

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      z: Math.random() * 800,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      vz: (Math.random() - 0.5) * 1.2,
      r: 1 + Math.random() * 2,
      hue: Math.random() > 0.5 ? 250 : 165,
      alpha: 0.3 + Math.random() * 0.5,
    }));

    /* ── Floating 3D shapes ── */
    const shapes = Array.from({ length: isMobile ? 4 : 8 }, (_, i) => ({
      x: (0.1 + Math.random() * 0.8) * W,
      y: (0.1 + Math.random() * 0.8) * H,
      z: 200 + Math.random() * 400,
      rotX: Math.random() * Math.PI * 2,
      rotY: Math.random() * Math.PI * 2,
      rotZ: Math.random() * Math.PI * 2,
      rsx: (Math.random() - 0.5) * 0.008,
      rsy: (Math.random() - 0.5) * 0.010,
      rsz: (Math.random() - 0.5) * 0.006,
      size: 20 + Math.random() * 30,
      type: i % 4,
      hue: [250, 165, 210, 45][i % 4],
      fo: Math.random() * Math.PI * 2,
    }));

    /* ── Neural network nodes ── */
    const nodes = Array.from({ length: isMobile ? 10 : 20 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 3 + Math.random() * 4,
    }));

    /* ── Orbital rings ── */
    const rings = [
      { cx: W*0.2, cy: H*0.3, rx:90, ry:32, rot:0, spd:0.003, hue:250 },
      { cx: W*0.8, cy: H*0.7, rx:70, ry:25, rot:2, spd:0.005, hue:165 },
      { cx: W*0.5, cy: H*0.5, rx:110,ry:40, rot:4, spd:0.004, hue:45  },
    ];

    const project = (x: number, y: number, z: number) => {
      const fov = 500;
      const scale = fov / (fov + z);
      const mx = (mouseX - W/2) * 0.05;
      const my = (mouseY - H/2) * 0.05;
      return {
        sx: (x - W/2 + mx) * scale + W/2,
        sy: (y - H/2 + my) * scale + H/2,
        scale,
      };
    };

    const drawShape = (s: typeof shapes[0]) => {
      s.rotX += s.rsx; s.rotY += s.rsy; s.rotZ += s.rsz;
      const fy = Math.sin(t * 0.005 + s.fo) * 15;
      const { sx, sy, scale } = project(s.x, s.y + fy, s.z);
      const sz = s.size * scale;
      const alpha = 0.1 + scale * 0.2;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(s.rotZ);

      if (s.type === 0) {
        /* cube */
        const cs = Math.cos(s.rotY) * sz * 0.5;
        const sn = Math.sin(s.rotY) * sz * 0.3;
        ctx.fillStyle = `hsla(${s.hue},70%,65%,${alpha})`;
        ctx.strokeStyle = `hsla(${s.hue},70%,80%,${alpha*1.5})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.rect(-sz/2,-sz/2,sz,sz);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = `hsla(${s.hue},70%,75%,${alpha*0.8})`;
        ctx.beginPath();
        ctx.moveTo(-sz/2,-sz/2);
        ctx.lineTo(-sz/2+cs,-sz/2-sn);
        ctx.lineTo( sz/2+cs,-sz/2-sn);
        ctx.lineTo( sz/2,-sz/2);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = `hsla(${s.hue},70%,55%,${alpha*0.9})`;
        ctx.beginPath();
        ctx.moveTo(sz/2,-sz/2);
        ctx.lineTo(sz/2+cs,-sz/2-sn);
        ctx.lineTo(sz/2+cs, sz/2-sn);
        ctx.lineTo(sz/2, sz/2);
        ctx.fill(); ctx.stroke();
      } else if (s.type === 1) {
        /* graduation cap */
        const tilt = Math.sin(s.rotX) * 0.3;
        ctx.transform(1,tilt,0,1-Math.abs(tilt)*0.2,0,0);
        ctx.fillStyle = `hsla(${s.hue},70%,65%,${alpha})`;
        ctx.fillRect(-sz/2,-sz/4,sz,sz/2);
        ctx.beginPath();
        ctx.arc(0,-sz/4,sz/6,0,Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = `hsla(45,90%,65%,${alpha*1.5})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sz/3,-sz/4);
        ctx.lineTo(sz/3, sz/4);
        ctx.stroke();
      } else if (s.type === 2) {
        /* DNA helix */
        for (let i = 0; i < 8; i++) {
          const a1 = (i/8)*Math.PI*2 + s.rotY;
          const yOff = (i/8 - 0.5) * sz * 1.5;
          ctx.beginPath();
          ctx.arc(Math.cos(a1)*sz*0.3, yOff, 3*scale, 0, Math.PI*2);
          ctx.fillStyle = `hsla(${s.hue},80%,70%,${alpha})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(Math.cos(a1+Math.PI)*sz*0.3, yOff, 3*scale,0,Math.PI*2);
          ctx.fillStyle = `hsla(${s.hue+30},80%,70%,${alpha})`;
          ctx.fill();
        }
      } else {
        /* star */
        const spikes = 6;
        const or = sz*0.5; const ir = sz*0.25;
        ctx.beginPath();
        for (let i = 0; i < spikes*2; i++) {
          const ang = (i*Math.PI)/spikes;
          const r = i%2===0?or:ir;
          const px = Math.cos(ang+s.rotZ)*r;
          const py = Math.sin(ang+s.rotZ)*r;
          i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
        }
        ctx.closePath();
        ctx.fillStyle = `hsla(${s.hue},90%,70%,${alpha})`;
        ctx.fill();
      }
      ctx.restore();
    };

    const drawNeural = () => {
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x<0||n.x>W) n.vx*=-1;
        if (n.y<0||n.y>H) n.vy*=-1;
      });
      for (let i=0;i<nodes.length;i++) {
        for (let j=i+1;j<nodes.length;j++) {
          const d = Math.hypot(nodes[i].x-nodes[j].x,
                               nodes[i].y-nodes[j].y);
          if (d<180) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x,nodes[i].y);
            ctx.lineTo(nodes[j].x,nodes[j].y);
            ctx.strokeStyle=`rgba(127,119,221,${(1-d/180)*0.10})`;
            ctx.lineWidth=0.5;
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(nodes[i].x,nodes[i].y,nodes[i].r,0,Math.PI*2);
        ctx.fillStyle='rgba(127,119,221,0.18)';
        ctx.fill();
      }
    };

    const drawRings = () => {
      rings.forEach(ring => {
        ring.rot += ring.spd;
        ctx.save();
        ctx.translate(ring.cx, ring.cy);
        ctx.beginPath();
        ctx.ellipse(0,0,ring.rx,ring.ry,ring.rot,0,Math.PI*2);
        ctx.strokeStyle=`hsla(${ring.hue},70%,65%,0.07)`;
        ctx.lineWidth=1;
        ctx.stroke();
        const da = ring.rot*3;
        const dx = Math.cos(da)*ring.rx;
        const dy = Math.sin(da)*ring.ry;
        const g = ctx.createRadialGradient(dx,dy,0,dx,dy,7);
        g.addColorStop(0,`hsla(${ring.hue},80%,70%,0.6)`);
        g.addColorStop(1,`hsla(${ring.hue},80%,70%,0)`);
        ctx.beginPath();
        ctx.arc(dx,dy,7,0,Math.PI*2);
        ctx.fillStyle=g;
        ctx.fill();
        ctx.restore();
      });
    };

    const draw = () => {
      t++;
      const bg = ctx.createLinearGradient(0,0,W,H);
      bg.addColorStop(0,'#05071a');
      bg.addColorStop(0.5,'#080d24');
      bg.addColorStop(1,'#050a1e');
      ctx.fillStyle=bg;
      ctx.fillRect(0,0,W,H);

      /* Dot grid */
      ctx.fillStyle='rgba(127,119,221,0.04)';
      for(let x=0;x<W;x+=60)
        for(let y=0;y<H;y+=60){
          ctx.beginPath();
          ctx.arc(x,y,1,0,Math.PI*2);
          ctx.fill();
        }

      drawNeural();
      drawRings();

      /* Particles */
      particles.forEach(p => {
        p.x+=p.vx; p.y+=p.vy; p.z+=p.vz;
        if(p.x<0)p.x=W; if(p.x>W)p.x=0;
        if(p.y<0)p.y=H; if(p.y>H)p.y=0;
        if(p.z<0)p.z=800; if(p.z>800)p.z=0;
        const {sx,sy,scale}=project(p.x,p.y,p.z);
        const r=p.r*scale;
        ctx.beginPath();
        ctx.arc(sx,sy,Math.max(r,0.3),0,Math.PI*2);
        ctx.fillStyle=`hsla(${p.hue},70%,70%,${p.alpha*scale})`;
        ctx.fill();
      });

      shapes.forEach(s=>drawShape(s));

      /* Glowing orbs */
      [[W*0.1,H*0.2,250],[W*0.85,H*0.15,165],[W*0.5,H*0.8,210]]
        .forEach(([ox,oy,hue],i)=>{
          const bx=ox+Math.sin(t*0.004+i)*60;
          const by=oy+Math.cos(t*0.003+i)*40;
          const g=ctx.createRadialGradient(bx,by,0,bx,by,200);
          g.addColorStop(0,`hsla(${hue},70%,65%,0.12)`);
          g.addColorStop(1,`hsla(${hue},70%,65%,0)`);
          ctx.beginPath();
          ctx.arc(bx,by,200,0,Math.PI*2);
          ctx.fillStyle=g;
          ctx.fill();
        });

      animId=requestAnimationFrame(draw);
    };

    draw();

    const onMM=(e:MouseEvent)=>{mouseX=e.clientX;mouseY=e.clientY;};
    const onResize=()=>{
      setSize();
      rings[0].cx=W*0.2; rings[0].cy=H*0.3;
      rings[1].cx=W*0.8; rings[1].cy=H*0.7;
      rings[2].cx=W*0.5; rings[2].cy=H*0.5;
    };

    window.addEventListener('mousemove',onMM);
    window.addEventListener('resize',onResize);
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden) cancelAnimationFrame(animId);
      else draw();
    });

    return ()=>{
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove',onMM);
      window.removeEventListener('resize',onResize);
    };
  },[]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position:'fixed',
        top:0, left:0,
        width:'100vw',
        height:'100vh',
        zIndex:0,
        pointerEvents:'none',
        display:'block',
      }}
    />
  );
}
