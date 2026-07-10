'use client';
import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Props {
  intensity?: 'low' | 'medium' | 'high';
}

export default function PageCanvas3D({ intensity='low' }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let animId: number;
    let t = 0;

    const setSize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    setSize();
    canvas.style.display = 'block';

    const mobile = W < 768;
    const counts = { low: mobile?20:40, medium: mobile?35:70, high: mobile?60:120 };
    const count = counts[intensity];

    const particles = Array.from({ length: count }, () => ({
      x: Math.random()*W,
      y: Math.random()*H,
      z: Math.random()*600,
      vx: (Math.random()-0.5)*0.2,
      vy: (Math.random()-0.5)*0.2,
      vz: (Math.random()-0.5)*0.8,
      r: 0.8+Math.random()*1.5,
      hue: Math.random()>0.5?250:165,
      alpha: 0.2+Math.random()*0.4,
    }));

    const accents = Array.from({ length: 5 }, (_,i) => ({
      x: Math.random()*W,
      y: Math.random()*H,
      size: 10+Math.random()*20,
      rot: Math.random()*Math.PI*2,
      rs: (Math.random()-0.5)*0.01,
      fo: Math.random()*Math.PI*2,
      hue: [250,165,45,210,0][i],
    }));

    const orbs = Array.from({ length: 3 }, (_,i) => ({
      x: [W*0.1,W*0.85,W*0.5][i],
      y: [H*0.2,H*0.15,H*0.8][i],
      hue: [250,165,210][i],
      phase: i*2,
    }));

    const draw = () => {
      ctx.clearRect(0,0,W,H);
      t++;

      /* Background */
      if (isDark) {
        const bg = ctx.createLinearGradient(0,0,W,H);
        bg.addColorStop(0,'#05071a');
        bg.addColorStop(1,'#080d24');
        ctx.fillStyle = bg;
        ctx.fillRect(0,0,W,H);
      } else {
        const bg = ctx.createLinearGradient(0,0,W,H);
        bg.addColorStop(0,'#f8f7ff');
        bg.addColorStop(1,'#eef8f4');
        ctx.fillStyle = bg;
        ctx.fillRect(0,0,W,H);
      }

      /* Grid */
      const ga = isDark?0.03:0.05;
      ctx.strokeStyle=`rgba(127,119,221,${ga})`;
      ctx.lineWidth=0.5;
      for(let x=0;x<W;x+=80){
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
      }
      for(let y=0;y<H;y+=80){
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
      }

      /* Glowing orbs */
      orbs.forEach(o=>{
        const bx=o.x+Math.sin(t*0.004+o.phase)*50;
        const by=o.y+Math.cos(t*0.003+o.phase)*35;
        const g=ctx.createRadialGradient(bx,by,0,bx,by,220);
        const a=isDark?0.12:0.07;
        g.addColorStop(0,`hsla(${o.hue},70%,65%,${a})`);
        g.addColorStop(1,`hsla(${o.hue},70%,65%,0)`);
        ctx.beginPath(); ctx.arc(bx,by,220,0,Math.PI*2);
        ctx.fillStyle=g; ctx.fill();
      });

      /* Particles */
      particles.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy; p.z+=p.vz;
        if(p.x<0)p.x=W; if(p.x>W)p.x=0;
        if(p.y<0)p.y=H; if(p.y>H)p.y=0;
        if(p.z<0)p.z=600; if(p.z>600)p.z=0;
        const fov=400;
        const scale=fov/(fov+p.z);
        const sx=(p.x-W/2)*scale+W/2;
        const sy=(p.y-H/2)*scale+H/2;
        const r=p.r*scale;
        const L=isDark?70:45;
        ctx.beginPath();
        ctx.arc(sx,sy,Math.max(r,0.2),0,Math.PI*2);
        ctx.fillStyle=`hsla(${p.hue},70%,${L}%,${p.alpha*scale*(isDark?0.8:0.5)})`;
        ctx.fill();
      });

      /* Accent triangles */
      accents.forEach(a=>{
        a.rot+=a.rs;
        const fy=Math.sin(t*0.005+a.fo)*8;
        const fx=Math.cos(t*0.003+a.fo)*4;
        ctx.save();
        ctx.translate(a.x+fx,a.y+fy);
        ctx.rotate(a.rot);
        ctx.beginPath();
        ctx.moveTo(0,-a.size);
        ctx.lineTo(a.size*0.866,a.size*0.5);
        ctx.lineTo(-a.size*0.866,a.size*0.5);
        ctx.closePath();
        const al=isDark?0.07:0.05;
        const L=isDark?65:45;
        ctx.strokeStyle=`hsla(${a.hue},70%,${L}%,${al})`;
        ctx.lineWidth=0.8;
        ctx.stroke();
        ctx.restore();
      });

      /* Wave lines (medium+) */
      if(intensity!=='low'){
        for(let i=0;i<2;i++){
          ctx.beginPath();
          ctx.moveTo(0,H*(0.3+i*0.3));
          for(let x=0;x<=W;x+=4){
            const y=H*(0.3+i*0.3)+
              Math.sin(x*0.004+t*0.006+i)*20;
            ctx.lineTo(x,y);
          }
          const wa=isDark?0.04:0.03;
          ctx.strokeStyle=`rgba(127,119,221,${wa})`;
          ctx.lineWidth=1;
          ctx.stroke();
        }
      }

      animId=requestAnimationFrame(draw);
    };

    draw();

    const onResize=()=>setSize();
    window.addEventListener('resize',onResize);
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden) cancelAnimationFrame(animId);
      else draw();
    });

    return ()=>{
      cancelAnimationFrame(animId);
      window.removeEventListener('resize',onResize);
    };
  },[isDark,intensity]);

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
