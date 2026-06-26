// Generate procedural planet textures using Canvas
// Tidak perlu download file external!

export const generatePlanetTexture = (planetName) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  switch (planetName.toLowerCase()) {
    case 'mercury':
      drawMercury(ctx, canvas.width, canvas.height);
      break;
    case 'venus':
      drawVenus(ctx, canvas.width, canvas.height);
      break;
    case 'earth':
      drawEarth(ctx, canvas.width, canvas.height);
      break;
    case 'mars':
      drawMars(ctx, canvas.width, canvas.height);
      break;
    case 'jupiter':
      drawJupiter(ctx, canvas.width, canvas.height);
      break;
    case 'saturn':
      drawSaturn(ctx, canvas.width, canvas.height);
      break;
    case 'uranus':
      drawUranus(ctx, canvas.width, canvas.height);
      break;
    case 'neptune':
      drawNeptune(ctx, canvas.width, canvas.height);
      break;
    case 'sun':
      drawSun(ctx, canvas.width, canvas.height);
      break;
    case 'moon':
      drawMoon(ctx, canvas.width, canvas.height);
      break;
    default:
      drawDefault(ctx, canvas.width, canvas.height);
  }

  return canvas;
};

// Helper: Noise function for natural patterns
const noise = (x, y, seed = 0) => {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
};

// Helper: Smooth noise
const smoothNoise = (x, y, scale = 1) => {
  const nx = x / scale;
  const ny = y / scale;
  const ix = Math.floor(nx);
  const iy = Math.floor(ny);
  const fx = nx - ix;
  const fy = ny - iy;
  
  const a = noise(ix, iy);
  const b = noise(ix + 1, iy);
  const c = noise(ix, iy + 1);
  const d = noise(ix + 1, iy + 1);
  
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  
  return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
};

// Helper: Draw craters
const drawCraters = (ctx, w, h, count, color1, color2) => {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = 2 + Math.random() * 8;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(0.7, color2);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
};

// Mercury - Gray, cratered
const drawMercury = (ctx, w, h) => {
  // Base color
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, '#8c7e6d');
  gradient.addColorStop(0.5, '#a09080');
  gradient.addColorStop(1, '#7a6e5d');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  
  // Add noise texture
  for (let x = 0; x < w; x += 2) {
    for (let y = 0; y < h; y += 2) {
      const n = smoothNoise(x, y, 20);
      ctx.fillStyle = `rgba(0,0,0,${n * 0.2})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  
  // Craters
  drawCraters(ctx, w, h, 30, 'rgba(60,50,40,0.5)', 'rgba(80,70,60,0.3)');
};

// Venus - Yellowish with clouds
const drawVenus = (ctx, w, h) => {
  // Base color
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, '#e6c229');
  gradient.addColorStop(0.5, '#d4a820');
  gradient.addColorStop(1, '#c9a025');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  
  // Cloud patterns
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const width = 20 + Math.random() * 60;
    const height = 5 + Math.random() * 15;
    
    ctx.fillStyle = `rgba(255,220,100,${0.1 + Math.random() * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(x, y, width, height, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
};

// Earth - Blue with green/brown land
const drawEarth = (ctx, w, h) => {
  // Ocean base
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, '#1a4a7a');
  gradient.addColorStop(0.3, '#2060a0');
  gradient.addColorStop(0.5, '#1a5090');
  gradient.addColorStop(0.7, '#2060a0');
  gradient.addColorStop(1, '#1a4a7a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  
  // Add ocean waves
  for (let x = 0; x < w; x += 3) {
    for (let y = 0; y < h; y += 3) {
      const n = smoothNoise(x, y, 30);
      ctx.fillStyle = `rgba(30,80,140,${n * 0.3})`;
      ctx.fillRect(x, y, 3, 3);
    }
  }
  
  // Land masses (simplified continents)
  const drawLand = (cx, cy, size) => {
    ctx.fillStyle = '#2d5a1e';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const r = size * (0.7 + Math.random() * 0.6);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    
    // Add some brown/desert areas
    ctx.fillStyle = '#8a7a40';
    ctx.beginPath();
    ctx.arc(cx + size * 0.2, cy, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  };
  
  drawLand(w * 0.15, h * 0.4, 30);  // Americas
  drawLand(w * 0.45, h * 0.35, 40); // Africa/Europe
  drawLand(w * 0.75, h * 0.45, 35); // Asia
  drawLand(w * 0.85, h * 0.7, 20);  // Australia
  
  // Ice caps
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, 15);
  ctx.fillRect(0, h - 15, w, 15);
  
  // Clouds
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    ctx.beginPath();
    ctx.ellipse(x, y, 15 + Math.random() * 25, 5 + Math.random() * 10, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
};

// Mars - Red with dark patches
const drawMars = (ctx, w, h) => {
  // Base red color
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, '#c1440e');
  gradient.addColorStop(0.5, '#d45520');
  gradient.addColorStop(1, '#b03a0a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  
  // Add texture
  for (let x = 0; x < w; x += 2) {
    for (let y = 0; y < h; y += 2) {
      const n = smoothNoise(x, y, 25);
      ctx.fillStyle = `rgba(0,0,0,${n * 0.25})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  
  // Dark patches (maria)
  ctx.fillStyle = 'rgba(80,30,10,0.4)';
  ctx.beginPath();
  ctx.ellipse(w * 0.3, h * 0.4, 60, 40, 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.ellipse(w * 0.7, h * 0.6, 50, 35, -0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Polar ice caps
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillRect(0, 0, w, 20);
  ctx.fillRect(0, h - 25, w, 25);
};

// Jupiter - Gas bands (improved)
const drawJupiter = (ctx, w, h) => {
  // Base color
  ctx.fillStyle = '#d8ca9d';
  ctx.fillRect(0, 0, w, h);
  
  // Add noise texture first
  for (let x = 0; x < w; x += 2) {
    for (let y = 0; y < h; y += 2) {
      const n = smoothNoise(x, y, 15);
      ctx.fillStyle = `rgba(180,150,100,${n * 0.3})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  
  // Detailed gas bands with varying widths
  const bands = [
    { y: 0.08, color: '#a07040', height: 0.04, wavy: true },
    { y: 0.15, color: '#c8a060', height: 0.06, wavy: false },
    { y: 0.25, color: '#8b6030', height: 0.05, wavy: true },
    { y: 0.33, color: '#d4b878', height: 0.08, wavy: false },
    { y: 0.45, color: '#a07040', height: 0.04, wavy: true },
    { y: 0.52, color: '#c8a060', height: 0.07, wavy: false },
    { y: 0.62, color: '#8b6030', height: 0.05, wavy: true },
    { y: 0.72, color: '#d4b878', height: 0.06, wavy: false },
    { y: 0.82, color: '#a07040', height: 0.04, wavy: true },
    { y: 0.9, color: '#c8a060', height: 0.05, wavy: false }
  ];
  
  bands.forEach(band => {
    ctx.fillStyle = band.color;
    
    if (band.wavy) {
      // Draw wavy band
      ctx.beginPath();
      ctx.moveTo(0, h * band.y);
      for (let x = 0; x <= w; x += 5) {
        const wave = Math.sin(x * 0.03) * 3 + Math.sin(x * 0.01) * 2;
        ctx.lineTo(x, h * band.y + wave);
      }
      for (let x = w; x >= 0; x -= 5) {
        const wave = Math.sin(x * 0.03) * 3 + Math.sin(x * 0.01) * 2;
        ctx.lineTo(x, h * (band.y + band.height) + wave);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(0, h * band.y, w, h * band.height);
    }
  });
  
  // Great Red Spot (larger and more detailed)
  const spotX = w * 0.62;
  const spotY = h * 0.42;
  
  // Outer swirl
  for (let i = 0; i < 5; i++) {
    const r = 30 - i * 4;
    const spotGradient = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, r);
    const alpha = 0.3 - i * 0.05;
    spotGradient.addColorStop(0, `rgba(200,60,30,${alpha})`);
    spotGradient.addColorStop(0.6, `rgba(180,50,25,${alpha * 0.6})`);
    spotGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = spotGradient;
    ctx.beginPath();
    ctx.ellipse(spotX, spotY, r, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Inner spot
  ctx.fillStyle = '#c44020';
  ctx.beginPath();
  ctx.ellipse(spotX, spotY, 15, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Small storm swirls
  const storms = [
    { x: 0.25, y: 0.3, size: 8 },
    { x: 0.45, y: 0.7, size: 6 },
    { x: 0.8, y: 0.25, size: 7 }
  ];
  
  storms.forEach(storm => {
    const stormGradient = ctx.createRadialGradient(
      w * storm.x, h * storm.y, 0,
      w * storm.x, h * storm.y, storm.size
    );
    stormGradient.addColorStop(0, 'rgba(200,100,60,0.4)');
    stormGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = stormGradient;
    ctx.beginPath();
    ctx.ellipse(w * storm.x, h * storm.y, storm.size, storm.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  });
};

// Saturn - Golden with detailed bands (improved)
const drawSaturn = (ctx, w, h) => {
  // Base golden color with gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, '#e8d0a0');
  gradient.addColorStop(0.2, '#f0d8b0');
  gradient.addColorStop(0.5, '#e0c898');
  gradient.addColorStop(0.8, '#f0d8b0');
  gradient.addColorStop(1, '#e8d0a0');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  
  // Add subtle noise texture
  for (let x = 0; x < w; x += 2) {
    for (let y = 0; y < h; y += 2) {
      const n = smoothNoise(x, y, 20);
      ctx.fillStyle = `rgba(180,150,100,${n * 0.15})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  
  // Detailed gas bands
  const bands = [
    { y: 0.1, color: '#d4b880', height: 0.04, opacity: 0.6 },
    { y: 0.2, color: '#c8a870', height: 0.03, opacity: 0.5 },
    { y: 0.3, color: '#dcc090', height: 0.05, opacity: 0.7 },
    { y: 0.4, color: '#c0a060', height: 0.04, opacity: 0.5 },
    { y: 0.5, color: '#d8bc88', height: 0.06, opacity: 0.6 },
    { y: 0.6, color: '#c8a870', height: 0.03, opacity: 0.5 },
    { y: 0.7, color: '#dcc090', height: 0.04, opacity: 0.6 },
    { y: 0.8, color: '#c0a060', height: 0.03, opacity: 0.5 },
    { y: 0.9, color: '#d4b880', height: 0.04, opacity: 0.6 }
  ];
  
  bands.forEach(band => {
    ctx.fillStyle = band.color;
    ctx.globalAlpha = band.opacity;
    ctx.fillRect(0, h * band.y, w, h * band.height);
  });
  ctx.globalAlpha = 1;
  
  // Hexagonal storm at north pole (subtle)
  const hexX = w * 0.5;
  const hexY = h * 0.08;
  ctx.strokeStyle = 'rgba(180,150,100,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const x = hexX + Math.cos(angle) * 12;
    const y = hexY + Math.sin(angle) * 8;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
};

// Uranus - Cyan/blue-green
const drawUranus = (ctx, w, h) => {
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, '#d1e7e7');
  gradient.addColorStop(0.5, '#b8d8d8');
  gradient.addColorStop(1, '#d1e7e7');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  
  // Subtle clouds
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.1 + Math.random() * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(
      Math.random() * w,
      Math.random() * h,
      20 + Math.random() * 40,
      5 + Math.random() * 10,
      Math.random() * Math.PI,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
};

// Neptune - Deep blue
const drawNeptune = (ctx, w, h) => {
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, '#5b5ddf');
  gradient.addColorStop(0.5, '#4040c0');
  gradient.addColorStop(1, '#5b5ddf');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  
  // Cloud bands
  ctx.fillStyle = 'rgba(100,100,220,0.3)';
  ctx.fillRect(0, h * 0.3, w, h * 0.05);
  ctx.fillRect(0, h * 0.55, w, h * 0.04);
  ctx.fillRect(0, h * 0.75, w, h * 0.05);
  
  // Dark spot
  const spotGradient = ctx.createRadialGradient(w * 0.4, h * 0.4, 0, w * 0.4, h * 0.4, 20);
  spotGradient.addColorStop(0, '#3030a0');
  spotGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = spotGradient;
  ctx.beginPath();
  ctx.ellipse(w * 0.4, h * 0.4, 20, 12, 0, 0, Math.PI * 2);
  ctx.fill();
};

// Sun - Bright yellow/orange with flares
const drawSun = (ctx, w, h) => {
  // Base gradient
  const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2);
  gradient.addColorStop(0, '#ffff80');
  gradient.addColorStop(0.3, '#ffcc00');
  gradient.addColorStop(0.6, '#ff9900');
  gradient.addColorStop(1, '#ff6600');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  
  // Solar flares
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = 10 + Math.random() * 30;
    
    const flareGradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    flareGradient.addColorStop(0, 'rgba(255,255,200,0.6)');
    flareGradient.addColorStop(0.5, 'rgba(255,200,100,0.3)');
    flareGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = flareGradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Surface texture
  for (let x = 0; x < w; x += 3) {
    for (let y = 0; y < h; y += 3) {
      const n = smoothNoise(x, y, 15);
      ctx.fillStyle = `rgba(255,150,0,${n * 0.3})`;
      ctx.fillRect(x, y, 3, 3);
    }
  }
};

// Moon - Gray with craters
const drawMoon = (ctx, w, h) => {
  // Base gray
  ctx.fillStyle = '#888888';
  ctx.fillRect(0, 0, w, h);
  
  // Add texture
  for (let x = 0; x < w; x += 2) {
    for (let y = 0; y < h; y += 2) {
      const n = smoothNoise(x, y, 15);
      ctx.fillStyle = `rgba(0,0,0,${n * 0.3})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  
  // Craters
  drawCraters(ctx, w, h, 50, 'rgba(60,60,60,0.6)', 'rgba(100,100,100,0.3)');
  
  // Dark maria
  ctx.fillStyle = 'rgba(50,50,50,0.4)';
  ctx.beginPath();
  ctx.ellipse(w * 0.3, h * 0.4, 40, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w * 0.7, h * 0.5, 35, 25, 0.3, 0, Math.PI * 2);
  ctx.fill();
};

// Default - Gray
const drawDefault = (ctx, w, h) => {
  ctx.fillStyle = '#888888';
  ctx.fillRect(0, 0, w, h);
};
