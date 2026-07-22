'use client';

export function triggerParticleBurst(x: number, y: number) {
  if (typeof window === 'undefined') return;
  const colors = [
    '#7F77DD','#5DCAA5','#FAC775',
    '#a89ef8','#1D9E75',
  ];
  const count = 12;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'particle';
    const angle = (i / count) * 360;
    const dist = 40 + Math.random() * 60;
    const tx = `translate(
      ${Math.cos(angle*Math.PI/180)*dist}px,
      ${Math.sin(angle*Math.PI/180)*dist}px
    )`;
    el.style.cssText = `
      left:${x}px; top:${y}px;
      width:${4+Math.random()*6}px;
      height:${4+Math.random()*6}px;
      background:${colors[i%colors.length]};
      --tx:${tx};
      animation-delay:${Math.random()*0.1}s;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }
}
