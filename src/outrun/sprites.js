// Procedural pixel-art textures (drawn on small 2D canvases, sampled with nearest filtering)
import { Texture } from 'pixi.js';

export const CAR_COLORS = {
  blue: '#00AACC', purple: '#AA44CC', red: '#CC4444', white: '#EEEEEE', green: '#44CC44'
};
const TRAFFIC_COLORS = ['#f0d020', '#e8e8e8', '#3060d0', '#d05010'];

// world width (in world units) of each sprite kind; height follows the texture aspect ratio
export const WORLD_WIDTH = {
  car: 400, truck: 460, pickup: 260,
  palm: 900, pine: 700, rock: 700, cactus: 500, sign: 1000, building: 1600, lamp: 360
};

function hex(n){ return '#' + n.toString(16).padStart(6, '0'); }

function shade(color, amount){
  const n = parseInt(color.slice(1), 16);
  const f = c => Math.max(0, Math.min(255, Math.round(c * amount)));
  return hex((f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255));
}

function canvasTexture(w, h, draw){
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  draw(ctx, w, h);
  return Texture.from(canvas);
}

function rect(ctx, color, x, y, w, h){
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// Rear view of a sports car, 64x32. steer shifts the cabin to fake a turn.
function drawCar(ctx, color, steer = 0, truck = false){
  const dark = shade(color, 0.6);
  const light = shade(color, 1.25);
  const s = steer * 2;
  rect(ctx, 'rgba(0,0,0,0.35)', 2, 28, 60, 4);           // shadow
  rect(ctx, '#111', 3 - s, 18, 11, 13);                    // wheels
  rect(ctx, '#111', 50 - s, 18, 11, 13);
  rect(ctx, '#333', 5 - s, 20, 7, 2);
  rect(ctx, '#333', 52 - s, 20, 7, 2);
  if(truck){
    rect(ctx, dark, 8, 0, 48, 18);                         // cargo box
    rect(ctx, color, 10, 2, 44, 14);
    rect(ctx, dark, 31, 2, 2, 14);
  } else {
    rect(ctx, dark, 15 + s, 4, 34, 2);                     // roof
    rect(ctx, color, 13 + s, 6, 38, 9);                    // cabin
    rect(ctx, '#1a2a40', 16 + s, 7, 32, 6);                // rear window
    rect(ctx, '#3a5a80', 17 + s, 7, 10, 2);
  }
  rect(ctx, color, 4, 14, 56, 12);                         // body
  rect(ctx, light, 4, 14, 56, 2);
  rect(ctx, dark, 4, 24, 56, 4);                           // bumper
  rect(ctx, '#ff2020', 7, 17, 12, 4);                      // tail lights
  rect(ctx, '#ff2020', 45, 17, 12, 4);
  rect(ctx, '#ffa0a0', 8, 18, 4, 1);
  rect(ctx, '#ffa0a0', 46, 18, 4, 1);
  rect(ctx, '#f0f0f0', 27, 19, 10, 4);                     // plate
  rect(ctx, '#222', 29, 20, 6, 2);
  rect(ctx, '#555', 26, 26, 3, 2);                         // exhaust
}

// player car frames indexed by steer: -1, 0, 1
export function makePlayerCar(colorName){
  const color = CAR_COLORS[colorName] || CAR_COLORS.blue;
  return {
    '-1': canvasTexture(64, 32, ctx => drawCar(ctx, color, -1)),
    '0': canvasTexture(64, 32, ctx => drawCar(ctx, color, 0)),
    '1': canvasTexture(64, 32, ctx => drawCar(ctx, color, 1))
  };
}

export function makeTraffic(){
  return TRAFFIC_COLORS.map((color, i) => canvasTexture(64, 32, ctx => drawCar(ctx, color, 0, i === 3)));
}

// traffic frames with the left (-1) or right (1) tail light blinking amber, indexed by dir then variant
export function makeTrafficBlink(){
  const blink = dir => TRAFFIC_COLORS.map((color, i) => canvasTexture(64, 32, ctx => {
    drawCar(ctx, color, 0, i === 3);
    rect(ctx, '#ffb000', dir < 0 ? 5 : 43, 15, 16, 8);
  }));
  return { '-1': blink(-1), '1': blink(1) };
}

export function makePickups(){
  const orb = (color, label) => canvasTexture(20, 20, ctx => {
    ctx.fillStyle = shade(color, 0.6);
    ctx.beginPath(); ctx.arc(10, 10, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(10, 10, 8, 0, Math.PI * 2); ctx.fill();
    rect(ctx, '#fff', 6, 5, 3, 2);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 10, 11);
  });
  return { invuln: orb('#2060ff', 'S'), scoreboost: orb('#ff9000', '2') };
}

export function makeScenery(){
  return {
    palm: canvasTexture(48, 80, ctx => {
      for(let y = 18; y < 80; y += 2){                       // curved trunk
        const x = 22 + Math.round(Math.sin(y / 20) * 4);
        rect(ctx, y % 4 ? '#8a5a2a' : '#6a4020', x, y, 5, 2);
      }
      const leaf = '#1f8a3a', leafDark = '#136028';
      [[-1, 0.2], [1, 0.2], [-1, 0.9], [1, 0.9], [0, 0]].forEach(([dir, droop]) => {
        for(let i = 0; i < 20; i++){
          const x = 24 + dir * i;
          const y = 18 - (dir === 0 ? i * 0.6 : 0) + Math.round(droop * (i * i) / 14) - (dir === 0 ? 0 : 3);
          rect(ctx, i % 3 ? leaf : leafDark, x - 1, y, 3, 3);
        }
      });
      rect(ctx, '#5a3a18', 21, 16, 7, 5);                    // coconuts
    }),
    pine: canvasTexture(40, 72, ctx => {
      rect(ctx, '#4a2a10', 18, 56, 5, 16);
      for(let i = 0; i < 4; i++){
        const top = 4 + i * 13, half = 7 + i * 4;
        ctx.fillStyle = i % 2 ? '#1a5a2a' : '#236b33';
        ctx.beginPath(); ctx.moveTo(20, top); ctx.lineTo(20 + half, top + 20); ctx.lineTo(20 - half, top + 20); ctx.fill();
      }
    }),
    rock: canvasTexture(56, 36, ctx => {
      ctx.fillStyle = '#6a5a50';
      ctx.beginPath(); ctx.moveTo(2, 36); ctx.lineTo(10, 12); ctx.lineTo(24, 2); ctx.lineTo(40, 8); ctx.lineTo(54, 36); ctx.fill();
      ctx.fillStyle = '#8a7a6a';
      ctx.beginPath(); ctx.moveTo(10, 12); ctx.lineTo(24, 2); ctx.lineTo(28, 20); ctx.lineTo(14, 30); ctx.fill();
    }),
    cactus: canvasTexture(32, 56, ctx => {
      const g = '#2f8a3a', d = '#1f6a2a';
      rect(ctx, g, 12, 4, 8, 52); rect(ctx, d, 17, 4, 3, 52);
      rect(ctx, g, 2, 20, 6, 4); rect(ctx, g, 2, 8, 5, 14);
      rect(ctx, g, 24, 26, 6, 4); rect(ctx, g, 25, 14, 5, 14);
    }),
    sign: canvasTexture(64, 44, ctx => {
      rect(ctx, '#555', 8, 20, 4, 24); rect(ctx, '#555', 52, 20, 4, 24);
      rect(ctx, '#fff', 0, 0, 64, 24); rect(ctx, '#e02020', 2, 2, 60, 20);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText('ENDURO', 32, 16);
    }),
    building: canvasTexture(64, 96, ctx => {
      rect(ctx, '#140a2a', 0, 8, 64, 88); rect(ctx, '#1e1040', 4, 12, 56, 84);
      rect(ctx, '#ff2d95', 0, 6, 64, 2);
      for(let y = 16; y < 92; y += 8){
        for(let x = 8; x < 56; x += 8){
          if(((x * 7 + y * 3) % 5) > 1) rect(ctx, (x + y) % 3 ? '#ffd860' : '#60e8ff', x, y, 4, 4);
        }
      }
    }),
    lamp: canvasTexture(20, 80, ctx => {
      rect(ctx, '#444', 9, 8, 3, 72); rect(ctx, '#444', 4, 6, 14, 3);
      rect(ctx, '#00e5ff', 2, 9, 7, 3); rect(ctx, 'rgba(0,229,255,0.35)', 0, 12, 11, 4);
    })
  };
}

// deterministic tileable ridge (periods divide the texture width)
function ridge(x, w, parts){
  return parts.reduce((sum, [amp, cycles, phase]) => sum + amp * Math.sin((x / w) * Math.PI * 2 * cycles + phase), 0);
}

// Sky gradient + sun (sized to the screen) and two tileable parallax layers per theme
export function makeBackdrop(theme, width, horizon){
  const sky = canvasTexture(width, horizon, (ctx, w, h) => {
    const bands = theme.sky.length * 3;
    for(let i = 0; i < bands; i++){ // banded "16-bit" gradient
      const c = theme.sky[Math.min(theme.sky.length - 1, Math.floor(i / 3))];
      rect(ctx, hex(c), 0, Math.floor(i * h / bands), w, Math.ceil(h / bands) + 1);
    }
    const sunX = w * 0.68, sunY = h * 0.52, r = h * 0.2;
    ctx.fillStyle = hex(theme.sun);
    ctx.beginPath(); ctx.arc(sunX, sunY, r, 0, Math.PI * 2); ctx.fill();
    for(let k = 0; k < 4; k++){ // synthwave stripes across the lower half of the sun
      rect(ctx, hex(theme.sky[theme.sky.length - 2]), sunX - r, sunY + 2 + k * 5, r * 2, 1 + k);
    }
    if(theme.sky[0] > 0x100000){ // daytime themes get pixel clouds
      [[0.12, 0.25], [0.42, 0.15], [0.85, 0.3]].forEach(([cx, cy]) => {
        rect(ctx, '#ffffff', w * cx, h * cy, 34, 6);
        rect(ctx, '#ffffff', w * cx + 8, h * cy - 4, 18, 5);
        rect(ctx, '#dfe8f5', w * cx, h * cy + 5, 34, 2);
      });
    } else { // night: stars
      for(let i = 0; i < 40; i++) rect(ctx, '#fff', (i * 73) % w, (i * 37) % Math.floor(h * 0.6), 1, 1);
    }
  });

  const layer = (height, color, parts, city) => canvasTexture(width * 2, height, (ctx, w, h) => {
    ctx.fillStyle = hex(color);
    for(let x = 0; x < w; x++){
      let top;
      if(city){
        const block = Math.floor(x / 14);
        top = h * 0.2 + ((block * 97) % 7) * (h * 0.1);
      } else {
        top = h * 0.5 + ridge(x, w, parts) * h * 0.45;
      }
      ctx.fillRect(x, Math.max(0, Math.round(top)), 1, h);
    }
    if(city){ // lit windows on the skyline
      for(let x = 2; x < w; x += 5){
        for(let y = Math.round(h * 0.45); y < h - 2; y += 6){
          if(((x * 11 + y * 7) % 9) < 2) rect(ctx, '#ffd860', x, y, 2, 2);
        }
      }
    }
  });

  const isCity = theme.scenery.includes('building');
  return {
    sky,
    far: layer(40, theme.far, [[0.5, 3, 0], [0.3, 7, 1], [0.15, 13, 2]], isCity),
    near: layer(22, theme.near, [[0.4, 5, 1], [0.3, 11, 0], [0.2, 23, 3]], false)
  };
}

export function colorToCss(n){ return hex(n); }
