const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const createIcon = (size) => {
  const r = size * 0.22;
  const center = size / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg"
    width="${size}" height="${size}"
    viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e1058"/>
        <stop offset="40%" stop-color="#6d28d9"/>
        <stop offset="100%" stop-color="#db2777"/>
      </linearGradient>
      <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.2)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </linearGradient>
      <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#e9d5ff"/>
      </linearGradient>
      <filter id="softShadow">
        <feDropShadow dx="0" dy="${size*0.015}"
          stdDeviation="${size*0.025}"
          flood-color="#000000" flood-opacity="0.35"/>
      </filter>
      <filter id="glow">
        <feGaussianBlur stdDeviation="${size*0.018}" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    <!-- Main background -->
    <rect width="${size}" height="${size}"
      rx="${r}" ry="${r}"
      fill="url(#bg)"/>

    <!-- Shine top half -->
    <rect width="${size}" height="${size*0.5}"
      rx="${r}" ry="${r}"
      fill="url(#shine)"/>

    <!-- Decorative background circles -->
    <circle cx="${size*0.1}" cy="${size*0.12}"
      r="${size*0.14}"
      fill="rgba(255,255,255,0.05)"/>
    <circle cx="${size*0.88}" cy="${size*0.88}"
      r="${size*0.18}"
      fill="rgba(255,255,255,0.04)"/>
    <circle cx="${size*0.9}" cy="${size*0.15}"
      r="${size*0.09}"
      fill="rgba(255,255,255,0.06)"/>

    <!-- Star sparkles -->
    <circle cx="${size*0.82}" cy="${size*0.28}"
      r="${size*0.018}"
      fill="rgba(255,255,255,0.7)"/>
    <circle cx="${size*0.18}" cy="${size*0.72}"
      r="${size*0.014}"
      fill="rgba(255,255,255,0.5)"/>
    <circle cx="${size*0.75}" cy="${size*0.75}"
      r="${size*0.012}"
      fill="rgba(255,220,100,0.7)"/>

    <!-- Graduation Cap -->
    <g transform="translate(${center}, ${size*0.22})"
      filter="url(#softShadow)">
      <!-- Cap diamond top -->
      <polygon
        points="0,${-size*0.16} ${size*0.22},${-size*0.03} 0,${size*0.09} ${-size*0.22},${-size*0.03}"
        fill="url(#capGrad)"/>
      <!-- Cap brim -->
      <rect x="${-size*0.2}" y="${-size*0.035}"
        width="${size*0.4}" height="${size*0.1}"
        rx="${size*0.02}"
        fill="rgba(255,255,255,0.85)"/>
      <!-- Gold tassel rope -->
      <line
        x1="${size*0.2}" y1="${size*0.025}"
        x2="${size*0.2}" y2="${size*0.17}"
        stroke="#FFD700"
        stroke-width="${size*0.028}"
        stroke-linecap="round"/>
      <!-- Tassel end -->
      <circle cx="${size*0.2}" cy="${size*0.18}"
        r="${size*0.032}"
        fill="#FFD700"/>
      <line
        x1="${size*0.2}" y1="${size*0.21}"
        x2="${size*0.18}" y2="${size*0.27}"
        stroke="#FFD700"
        stroke-width="${size*0.014}"
        stroke-linecap="round"/>
      <line
        x1="${size*0.2}" y1="${size*0.21}"
        x2="${size*0.2}" y2="${size*0.28}"
        stroke="#FFD700"
        stroke-width="${size*0.014}"
        stroke-linecap="round"/>
      <line
        x1="${size*0.2}" y1="${size*0.21}"
        x2="${size*0.22}" y2="${size*0.27}"
        stroke="#FFD700"
        stroke-width="${size*0.014}"
        stroke-linecap="round"/>
    </g>

    <!-- CM Text -->
    <text x="${center}" y="${size*0.54}"
      font-family="Arial Black, Arial, sans-serif"
      font-size="${size*0.28}"
      font-weight="900"
      fill="white"
      text-anchor="middle"
      dominant-baseline="middle"
      filter="url(#softShadow)"
      letter-spacing="${size*0.005}">CM</text>

    <!-- CollegeMatch label -->
    <text x="${center}" y="${size*0.77}"
      font-family="Arial, sans-serif"
      font-size="${size*0.075}"
      font-weight="700"
      fill="rgba(255,255,255,0.75)"
      text-anchor="middle"
      letter-spacing="${size*0.006}">COLLEGEMATCH AI</text>

    <!-- Bottom glow line -->
    <rect x="${size*0.25}" y="${size*0.84}"
      width="${size*0.5}" height="${size*0.007}"
      rx="${size*0.004}"
      fill="rgba(255,255,255,0.25)"/>
  </svg>`;
};

// Generate all sizes
sizes.forEach(size => {
  const svg = createIcon(size);
  fs.writeFileSync(
    path.join(__dirname, `icon-${size}x${size}.svg`),
    svg
  );
  console.log(`✅ Created icon-${size}x${size}.svg`);
});

// Maskable icon (full bleed for Android)
const maskable = createIcon(512)
  .replace(`rx="114"`, 'rx="0"')
  .replace(`ry="114"`, 'ry="0"');

fs.writeFileSync(
  path.join(__dirname, 'maskable-icon.svg'),
  maskable
);
console.log('✅ Created maskable-icon.svg');
console.log('🎉 All CollegeMatch AI icons created!');
