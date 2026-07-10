'use client';
import { useEffect, useRef } from 'react';

export default function LoginBackground() {
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

    const setSize=()=>{
      W=window.innerWidth; H=window.innerHeight;
      canvas.width=W; canvas.height=H;
    };
    setSize();
    canvas.style.display='block';

    const mobile = W < 768;
    const pc = mobile ? 30 : 60;

    const orbs = [
      {x:W*0.15,y:H*0.3,r:200,hue:250,vx:0.3,vy:0.2,a:0.14},
      {x:W*0.7, y:H*0.2,r:180,hue:165,vx:-0.2,vy:0.3,a:0.12},
      {x:W*0.4, y:H*0.7,r:220,hue:210,vx:0.15,vy:-0.25,a:0.10},
      {x:W*0.85,y:H*0.6,r:160,hue:280,vx:-0.3,vy:0.2,a:0.12},
    ];

    const particles = Array.from({length:pc},()=>({
      x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-0.5)*0.3,
      vy:-0.2-Math.random()*0.4,
      r:1+Math.random()*2,
      alpha:0.2+Math.random()*0.5,
    }));

    const draw=()=>{
      t++;
      const bg=ctx.createLinearGradient(0,0,W,H);
      bg.addColorStop(0,'#0a0818');
      bg.addColorStop(0.5,'#0d1124');
      bg.addColorStop(1,'#080d1a');
      ctx.fillStyle=bg;
      ctx.fillRect(0,0,W,H);

      /* Dot grid */
      ctx.fillStyle='rgba(130,120,255,0.05)';
      for(let x=0;x<W;x+=40)
        for(let y=0;y<H;y+=40){
          ctx.beginPath(); ctx.arc(x,y,1,0,Math.PI*2); ctx.fill();
        }

      /* Orbs */
      orbs.forEach(o=>{
        o.x+=o.vx; o.y+=o.vy;
        if(o.x<-o.r)o.x=W+o.r;
        if(o.x>W+o.r)o.x=-o.r;
        if(o.y<-o.r)o.y=H+o.r;
        if(o.y>H+o.r)o.y=-o.r;
        const g=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r);
        g.addColorStop(0,`hsla(${o.hue},80%,65%,${o.a})`);
        g.addColorStop(1,`hsla(${o.hue},80%,65%,0)`);
        ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,Math.PI*2);
        ctx.fillStyle=g; ctx.fill();
      });

      /* Particles */
      particles.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy;
        if(p.y<-5){p.y=H+5;p.x=Math.random()*W;}
        if(p.x<0)p.x=W; if(p.x>W)p.x=0;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(160,150,255,${p.alpha})`;
        ctx.fill();
      });

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
