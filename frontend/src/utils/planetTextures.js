// Generate realistic procedural planet textures using Canvas
// Multi-octave noise for natural-looking surfaces

function seedRandom(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function lerp(a, b, t) { return a + (b - a) * t; }

function smoothNoise(x, y, scale) {
  const nx = x / scale, ny = y / scale;
  const ix = Math.floor(nx), iy = Math.floor(ny);
  const fx = nx - ix, fy = ny - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = seedRandom(ix, iy);
  const b = seedRandom(ix + 1, iy);
  const c = seedRandom(ix, iy + 1);
  const d = seedRandom(ix + 1, iy + 1);
  return lerp(lerp(a, b, sx), lerp(c, d, sx), sy);
}

function fbm(x, y, octaves, lacunarity, gain) {
  let value = 0, amplitude = 1, frequency = 1, maxValue = 0;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * smoothNoise(x * frequency, y * frequency, 1);
    maxValue += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }
  return value / maxValue;
}

function drawCraters(ctx, w, h, count, darkColor, lightColor) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w, y = Math.random() * h;
    const r = 2 + Math.random() * 10;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, darkColor);
    g.addColorStop(0.6, lightColor);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Mercury - realistic gray with heavy cratering
function drawMercury(ctx, w, h) {
  for (let x = 0; x < w; x += 2) {
    for (let y = 0; y < h; y += 2) {
      const n = fbm(x, y, 5, 2.0, 0.5);
      const r = Math.floor(lerp(120, 170, n));
      const g = Math.floor(lerp(110, 155, n));
      const b = Math.floor(lerp(100, 140, n));
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  drawCraters(ctx, w, h, 80, 'rgba(40,35,30,0.5)', 'rgba(140,130,120,0.3)');
  drawCraters(ctx, w, h, 40, 'rgba(30,25,20,0.6)', 'rgba(120,110,100,0.2)');
}

// Venus - thick yellowish atmosphere
function drawVenus(ctx, w, h) {
  for (let x = 0; x < w; x += 2) {
    for (let y = 0; y < h; y += 2) {
      const n = fbm(x, y, 4, 3.0, 0.6);
      const r = Math.floor(lerp(220, 245, n));
      const g = Math.floor(lerp(190, 220, n));
      const b = Math.floor(lerp(100, 140, n));
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * w, y = Math.random() * h;
    const rw = 30 + Math.random() * 80, rh = 5 + Math.random() * 15;
    ctx.fillStyle = `rgba(255,240,200,${0.05 + Math.random() * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(x, y, rw, rh, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Earth - NOT procedural, use real texture file
// (handled by textureLoader.js)

// Mars - realistic red with polar caps and dark regions
function drawMars(ctx, w, h) {
  for (let x = 0; x < w; x += 2) {
    for (let y = 0; y < h; y += 2) {
      const n = fbm(x, y, 5, 2.5, 0.5);
      const r = Math.floor(lerp(180, 220, n));
      const g = Math.floor(lerp(60, 100, n));
      const b = Math.floor(lerp(20, 50, n));
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  // Dark regions (Syrtis Major, etc.)
  for (let i = 0; i < 3; i++) {
    const cx = Math.random() * w, cy = Math.random() * h;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60 + Math.random() * 40);
    g.addColorStop(0, 'rgba(60,20,5,0.4)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 60 + Math.random() * 40, 30 + Math.random() * 20, Math.random(), 0, Math.PI * 2);
    ctx.fill();
  }
  // Polar caps
  const capGrad = ctx.createLinearGradient(0, 0, 0, h * 0.15);
  capGrad.addColorStop(0, 'rgba(255,255,250,0.8)');
  capGrad.addColorStop(0.5, 'rgba(240,235,230,0.3)');
  capGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = capGrad;
  ctx.fillRect(0, 0, w, h * 0.15);
  const capGrad2 = ctx.createLinearGradient(0, h, 0, h * 0.85);
  capGrad2.addColorStop(0, 'rgba(255,255,250,0.7)');
  capGrad2.addColorStop(0.5, 'rgba(240,235,230,0.2)');
  capGrad2.addColorStop(1, 'transparent');
  ctx.fillStyle = capGrad2;
  ctx.fillRect(0, h * 0.85, w, h * 0.15);
}

// Jupiter - detailed gas bands with Great Red Spot
function drawJupiter(ctx, w, h) {
  // Base
  for (let x = 0; x < w; x += 2) {
    for (let y = 0; y < h; y += 2) {
      const n = fbm(x, y, 4, 3.0, 0.5);
      const r = Math.floor(lerp(180, 220, n));
      const g = Math.floor(lerp(150, 190, n));
      const b = Math.floor(lerp(100, 140, n));
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  // Turbulent bands
  const bands = [
    { y: 0.05, h: 0.04, r: 160, g: 110, b: 60, a: 0.7 },
    { y: 0.12, h: 0.06, r: 210, g: 170, b: 110, a: 0.5 },
    { y: 0.22, h: 0.05, r: 140, g: 90, b: 40, a: 0.8 },
    { y: 0.30, h: 0.07, r: 200, g: 160, b: 100, a: 0.4 },
    { y: 0.40, h: 0.04, r: 150, g: 100, b: 50, a: 0.7 },
    { y: 0.48, h: 0.06, r: 220, g: 180, b: 120, a: 0.5 },
    { y: 0.58, h: 0.05, r: 140, g: 90, b: 40, a: 0.8 },
    { y: 0.68, h: 0.06, r: 210, g: 170, b: 110, a: 0.4 },
    { y: 0.78, h: 0.04, r: 160, g: 110, b: 60, a: 0.6 },
    { y: 0.88, h: 0.05, r: 200, g: 160, b: 100, a: 0.5 },
  ];
  bands.forEach(b => {
    ctx.fillStyle = `rgba(${b.r},${b.g},${b.b},${b.a})`;
    ctx.beginPath();
    ctx.moveTo(0, h * b.y);
    for (let x = 0; x <= w; x += 3) {
      const wave = Math.sin(x * 0.02) * 4 + Math.sin(x * 0.007) * 3;
      ctx.lineTo(x, h * b.y + wave);
    }
    for (let x = w; x >= 0; x -= 3) {
      const wave = Math.sin(x * 0.02) * 4 + Math.sin(x * 0.007) * 3;
      ctx.lineTo(x, h * (b.y + b.h) + wave);
    }
    ctx.closePath();
    ctx.fill();
  });
  // Great Red Spot
  const sx = w * 0.62, sy = h * 0.42;
  for (let i = 0; i < 6; i++) {
    const r = 35 - i * 4;
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
    const a = 0.35 - i * 0.05;
    g.addColorStop(0, `rgba(210,70,30,${a})`);
    g.addColorStop(0.5, `rgba(180,50,20,${a * 0.7})`);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(sx, sy, r, r * 0.55, 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(200,50,20,0.8)';
  ctx.beginPath();
  ctx.ellipse(sx, sy, 14, 8, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Small storms
  [[0.25, 0.3, 8], [0.48, 0.72, 7], [0.78, 0.22, 9]].forEach(([sx, sy, sz]) => {
    const g = ctx.createRadialGradient(w * sx, h * sy, 0, w * sx, h * sy, sz);
    g.addColorStop(0, 'rgba(200,90,50,0.4)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(w * sx, h * sy, sz, sz * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Saturn - golden bands with subtle detail
function drawSaturn(ctx, w, h) {
  for (let x = 0; x < w; x += 2) {
    for (let y = 0; y < h; y += 2) {
      const n = fbm(x, y, 4, 3.0, 0.5);
      const r = Math.floor(lerp(220, 245, n));
      const g = Math.floor(lerp(190, 220, n));
      const b = Math.floor(lerp(140, 175, n));
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  const bands = [
    { y: 0.08, h: 0.04, r: 200, g: 170, b: 120, a: 0.5 },
    { y: 0.18, h: 0.03, r: 180, g: 150, b: 100, a: 0.4 },
    { y: 0.28, h: 0.05, r: 210, g: 180, b: 130, a: 0.5 },
    { y: 0.40, h: 0.03, r: 190, g: 160, b: 110, a: 0.4 },
    { y: 0.52, h: 0.04, r: 200, g: 170, b: 120, a: 0.5 },
    { y: 0.65, h: 0.03, r: 180, g: 150, b: 100, a: 0.4 },
    { y: 0.78, h: 0.04, r: 210, g: 180, b: 130, a: 0.5 },
    { y: 0.90, h: 0.03, r: 190, g: 160, b: 110, a: 0.4 },
  ];
  bands.forEach(b => {
    ctx.fillStyle = `rgba(${b.r},${b.g},${b.b},${b.a})`;
    ctx.fillRect(0, h * b.y, w, h * b.h);
  });
  // Hexagon at north pole
  ctx.strokeStyle = 'rgba(180,150,100,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  const hx = w * 0.5, hy = h * 0.06;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const x = hx + Math.cos(a) * 10, y = hy + Math.sin(a) * 7;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

// Uranus - pale cyan-blue
function drawUranus(ctx, w, h) {
  for (let x = 0; x < w; x += 2) {
    for (let y = 0; y < h; y += 2) {
      const n = fbm(x, y, 3, 3.0, 0.5);
      const r = Math.floor(lerp(190, 220, n));
      const g = Math.floor(lerp(220, 240, n));
      const b = Math.floor(lerp(225, 245, n));
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  for (let i = 0; i < 15; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * w, Math.random() * h, 20 + Math.random() * 50, 3 + Math.random() * 8, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Neptune - deep blue with Great Dark Spot
function drawNeptune(ctx, w, h) {
  for (let x = 0; x < w; x += 2) {
    for (let y = 0; y < h; y += 2) {
      const n = fbm(x, y, 4, 3.0, 0.5);
      const r = Math.floor(lerp(40, 80, n));
      const g = Math.floor(lerp(50, 90, n));
      const b = Math.floor(lerp(180, 230, n));
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  // Cloud bands
  ctx.fillStyle = 'rgba(100,120,230,0.25)';
  ctx.fillRect(0, h * 0.28, w, h * 0.04);
  ctx.fillRect(0, h * 0.52, w, h * 0.05);
  ctx.fillRect(0, h * 0.74, w, h * 0.04);
  // Great Dark Spot
  const g = ctx.createRadialGradient(w * 0.4, h * 0.40, 0, w * 0.4, h * 0.40, 22);
  g.addColorStop(0, 'rgba(20,30,140,0.7)');
  g.addColorStop(0.5, 'rgba(30,40,160,0.3)');
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(w * 0.4, h * 0.40, 22, 14, 0, 0, Math.PI * 2);
  ctx.fill();
}

// Sun - realistic solar surface with granulation
function drawSun(ctx, w, h) {
  // Multi-layer radial gradient
  const g = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2);
  g.addColorStop(0, '#fffde0');
  g.addColorStop(0.15, '#fff9c4');
  g.addColorStop(0.3, '#ffcc00');
  g.addColorStop(0.5, '#ff9900');
  g.addColorStop(0.7, '#ff6600');
  g.addColorStop(0.85, '#e65100');
  g.addColorStop(1, '#bf360c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // Granulation (surface cells)
  for (let x = 0; x < w; x += 3) {
    for (let y = 0; y < h; y += 3) {
      const n = fbm(x, y, 6, 2.5, 0.5);
      const alpha = 0.05 + n * 0.25;
      const r = Math.floor(255), gV = Math.floor(200 + n * 55), b = Math.floor(50 + n * 100);
      ctx.fillStyle = `rgba(${r},${gV},${b},${alpha})`;
      ctx.fillRect(x, y, 3, 3);
    }
  }
  // Sunspots
  for (let i = 0; i < 8; i++) {
    const sx = w * (0.15 + Math.random() * 0.7);
    const sy = h * (0.1 + Math.random() * 0.8);
    const sr = 4 + Math.random() * 12;
    const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    sg.addColorStop(0, 'rgba(40,20,0,0.8)');
    sg.addColorStop(0.5, 'rgba(80,40,10,0.4)');
    sg.addColorStop(1, 'transparent');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  // Bright faculae
  for (let i = 0; i < 20; i++) {
    const fx = Math.random() * w, fy = Math.random() * h;
    const fr = 3 + Math.random() * 8;
    const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
    fg.addColorStop(0, 'rgba(255,255,220,0.5)');
    fg.addColorStop(1, 'transparent');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(fx, fy, fr, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Moon - realistic gray with craters and maria
function drawMoon(ctx, w, h) {
  for (let x = 0; x < w; x += 2) {
    for (let y = 0; y < h; y += 2) {
      const n = fbm(x, y, 5, 2.0, 0.5);
      const v = Math.floor(lerp(140, 210, n));
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  // Dark maria
  [{ x: 0.3, y: 0.4, rx: 50, ry: 35 }, { x: 0.7, y: 0.5, rx: 40, ry: 30 }, { x: 0.5, y: 0.3, rx: 30, ry: 25 }].forEach(m => {
    const g = ctx.createRadialGradient(w * m.x, h * m.y, 0, w * m.x, h * m.y, m.rx);
    g.addColorStop(0, 'rgba(60,60,60,0.5)');
    g.addColorStop(0.5, 'rgba(80,80,80,0.2)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(w * m.x, h * m.y, m.rx, m.ry, Math.random(), 0, Math.PI * 2);
    ctx.fill();
  });
  drawCraters(ctx, w, h, 60, 'rgba(40,40,40,0.6)', 'rgba(180,180,180,0.3)');
  drawCraters(ctx, w, h, 30, 'rgba(30,30,30,0.7)', 'rgba(160,160,160,0.2)');
}

function drawDefault(ctx, w, h) {
  ctx.fillStyle = '#888888';
  ctx.fillRect(0, 0, w, h);
}

export const generatePlanetTexture = (planetName) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  switch (planetName.toLowerCase()) {
    case 'mercury': drawMercury(ctx, canvas.width, canvas.height); break;
    case 'venus': drawVenus(ctx, canvas.width, canvas.height); break;
    case 'earth': drawDefault(ctx, canvas.width, canvas.height); break; // Use real texture
    case 'mars': drawMars(ctx, canvas.width, canvas.height); break;
    case 'jupiter': drawJupiter(ctx, canvas.width, canvas.height); break;
    case 'saturn': drawSaturn(ctx, canvas.width, canvas.height); break;
    case 'uranus': drawUranus(ctx, canvas.width, canvas.height); break;
    case 'neptune': drawNeptune(ctx, canvas.width, canvas.height); break;
    case 'sun': drawSun(ctx, canvas.width, canvas.height); break;
    case 'moon': drawDefault(ctx, canvas.width, canvas.height); break; // Use real texture
    default: drawDefault(ctx, canvas.width, canvas.height);
  }
  return canvas;
};