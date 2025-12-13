import { hello } from './utils.js';
import Car from './entities/Car.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// compute lane positions dynamically to ensure equal lane widths
const roadX = 64;
const roadW = canvas.width - 128;
function computeLanePositions(){
  // 3 lanes centered at 1/6, 3/6, 5/6 of road width
  const centers = [1/6, 3/6, 5/6].map(f => Math.round(roadX + roadW * f));
  return centers;
}
let lanePositions = computeLanePositions();
const car = new Car(1, lanePositions);

// Obstacles for browser runtime
import Obstacle from './entities/Obstacle.js';
import { LevelManager } from './levelManager.js';
const obstacles = []; // active obstacles array
const spawnRate = 0.9; // per second
let spawnAccumulator = 0; // reserved for future rate logic

const levelManager = new LevelManager();
let phaseOverlayTimer = 0;

// sprite images (8-bit SVGs)
const carImg = new Image();
let carImgLoaded = false;
carImg.onload = () => { carImgLoaded = true; };
carImg.src = 'assets/images/car.svg';

const obstacleImg = new Image();
let obstacleImgLoaded = false;
obstacleImg.onload = () => { obstacleImgLoaded = true; };
obstacleImg.src = 'assets/images/obstacle.svg';

// silence unused warning for elapsedTime until HUD uses it
/* eslint-disable no-unused-vars */
let _elapsedTime_suppress = null;
/* eslint-enable no-unused-vars */

// Lives and invulnerability for browser
let lives = 3;
let invulTimer = 0; // seconds
const invulSeconds = 1.5;

// Score and timer (simple in-main manager)
let score = 0;
let elapsedTime = 0;
const pointsPerSec = 10;

// Game state
let running = true;
let paused = false;
let flashTimer = 0; // visual flash on hit

// Pause overlay timer for smooth display
let pauseOverlay = false;

let last = performance.now();
const TICK = 1000/60;
let accumulator = 0;

// Input handling
const inputState = { left:false, right:false };
window.addEventListener('keydown', (e) => {
  // Pause toggle: Space or P
  if(e.key === 'p' || e.key === 'P' || e.key === ' ') {
    if(!running) return; // don't pause when game over
    paused = !paused;
    pauseOverlay = paused;
    return;
  }
  // When paused ignore input
  if(paused) return;
  if(e.key === 'ArrowLeft' || e.key === 'a') { inputState.left = true; car.moveLeft(); }
  if(e.key === 'ArrowRight' || e.key === 'd') { inputState.right = true; car.moveRight(); }
});
window.addEventListener('keyup', (e) => {
  if(e.key === 'ArrowLeft' || e.key === 'a') { inputState.left = false; }
  if(e.key === 'ArrowRight' || e.key === 'd') { inputState.right = false; }
  if(e.key === 'r' || e.key === 'R') {
    // restart on R
    resetGame();
  }
});

// Pointer / click zones
canvas.addEventListener('pointerdown', (ev) => {
  if(paused || !running) return;
  const rect = canvas.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  if(x < canvas.width/2) car.moveLeft(); else car.moveRight();
});

function aabbOverlap(ax, ay, aw, ah, bx, by, bw, bh){
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function update(dt){
  if(!running || paused) return;
  // dt in seconds
  car.update(dt);

  // scoring/time
  elapsedTime += dt;
  score += pointsPerSec * dt;

  // level manager update (returns true on transition)
  const transitioned = levelManager.update(dt);
  if(transitioned){ phaseOverlayTimer = 2; }

  // spawn logic based on current phase
  const diff = levelManager.getDifficulty();
  const dynamicSpawn = diff.spawnRate;
  if(Math.random() < dynamicSpawn * dt){
    const lane = Math.floor(Math.random() * lanePositions.length);
    const speed = 80 * diff.baseSpeed + Math.random() * 60;
    const spawnY = -60;
    // ensure lane spacing: don't spawn if nearest obstacle in this lane is too close to spawn point
    const laneObs = obstacles.filter(o => o.lane === lane);
    let nearest = null;
    for(const o of laneObs){
      if(o.y > spawnY && (nearest === null || o.y < nearest.y)) nearest = o;
    }
    const minGap = 100; // pixels
    if(!nearest || (nearest.y - spawnY) >= minGap){
      obstacles.push(new Obstacle(lane, lanePositions, spawnY, speed));
    }
  }

  // update obstacles
  obstacles.forEach(o => o.update(dt));
  // remove offscreen
  for(let i = obstacles.length - 1; i >= 0; i--){
    if(obstacles[i].isOffscreen(canvas.height)) obstacles.splice(i,1);
  }

  // invulnerability update
  if(invulTimer > 0){ invulTimer = Math.max(0, invulTimer - dt); }
  if(flashTimer > 0){ flashTimer = Math.max(0, flashTimer - dt); }

  // collision checks
  if(invulTimer <= 0){
    for(const o of obstacles){
      const collided = aabbOverlap(car.x - 16, car.y - 24, 32, 48, o.x - o.width/2, o.y - o.height/2, o.width, o.height);
      if(collided){
        lives = Math.max(0, lives - 1);
        invulTimer = invulSeconds;
        flashTimer = 0.3;
        // vibrate if available
        if(navigator.vibrate) navigator.vibrate(100);
        console.log('Hit! lives=', lives);
        if(lives <= 0){
          running = false;
        }
        break;
      }
    }
  }
}

function render(interp){
  // background colors based on phase
  const phaseId = levelManager.getCurrentPhase().id;
  const phaseColors = {
    1: { margin:'#111', road:'#2b2b2b', divider:'#444' }, // Country Roads
    2: { margin:'#0f0f0f', road:'#3a3430', divider:'#5a5047' }, // Mountain Pass (earthy)
    3: { margin:'#221c18', road:'#5a4b2b', divider:'#7a6b4b' }, // Desert Highway (sandy)
    4: { margin:'#050611', road:'#0d1220', divider:'#26324a' } // Night City (dark blue)
  };
  const colors = phaseColors[phaseId] || phaseColors[1];

  // margins/background
  ctx.fillStyle = colors.margin;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // road
  const roadX = 64;
  const roadW = canvas.width - 128;
  ctx.fillStyle = colors.road;
  // start road at top (no top margin)
  ctx.fillRect(roadX, 0, roadW, canvas.height);

  // lane dividers
  ctx.strokeStyle = colors.divider;
  ctx.lineWidth = 4;
  const lanes = lanePositions.length;
  for(let i=1;i<lanes;i++){
    const x = (lanePositions[i-1] + lanePositions[i]) / 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // draw obstacles with speed-based color coding
  obstacles.forEach(o=>{
    const speed = o.speed;
    if(obstacleImgLoaded){
      // Draw the image first
      ctx.drawImage(obstacleImg, o.x - o.width/2, o.y - o.height/2, o.width, o.height);
      // Apply speed-based tint overlay
      let tint;
      if(speed < 100) tint = 'rgba(100, 255, 100, 0.3)'; // greenish for slow
      else if(speed < 150) tint = 'rgba(255, 255, 100, 0.3)'; // yellowish for medium
      else tint = 'rgba(255, 100, 100, 0.3)'; // reddish for fast
      ctx.fillStyle = tint;
      ctx.fillRect(o.x - o.width/2, o.y - o.height/2, o.width, o.height);
    } else {
      // Fallback colors when image not loaded
      if(speed < 100) ctx.fillStyle = '#5f5';
      else if(speed < 150) ctx.fillStyle = '#ff5';
      else ctx.fillStyle = '#f55';
      ctx.fillRect(o.x - o.width/2, o.y - o.height/2, o.width, o.height);
    }
  });

  // draw player car as image when available
  const carW = 32;
  const carH = 48;
  if(carImgLoaded){
    ctx.drawImage(carImg, car.x - carW/2, car.y - carH/2, carW, carH);
  } else {
    ctx.fillStyle = invulTimer > 0 ? '#ff0' : '#0ff';
    ctx.fillRect(car.x - carW/2, car.y - carH/2, carW, carH);
  }

  // Header: centered "Enduro 8-bit"
  ctx.fillStyle = '#0f0';
  ctx.font = '18px monospace';
  const header = 'Enduro 8-bit';
  const headerW = ctx.measureText(header).width;
  ctx.fillText(header, canvas.width/2 - headerW/2, 22);

  // HUD: score and lives on the top corners
  ctx.font = '14px monospace';
  ctx.fillText('Score: '+Math.floor(score), 18, 44);
  ctx.fillText('Lives: '+lives, canvas.width - 100, 44);

  // flash effect
  if(flashTimer > 0){
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }

  // phase title overlay (small pill below HUD)
  if(phaseOverlayTimer > 0){
    const boxW = Math.min(360, canvas.width - 160);
    const boxH = 36;
    const boxX = (canvas.width - boxW) / 2;
    const boxY = 60; // below header and HUD
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.fillStyle = '#fff';
    ctx.font = '18px monospace';
    const name = levelManager.getCurrentPhase().name;
    const textW = ctx.measureText(name).width;
    ctx.fillText(name, canvas.width/2 - textW/2, boxY + boxH/2 + 6);
  }

  // pause overlay
  if(paused){
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.fillText('PAUSED', canvas.width/2 - 40, canvas.height/2);
  }

  // game over overlay
  if(!running){
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.fillText('GAME OVER', canvas.width/2 - 70, canvas.height/2 - 10);
    ctx.font = '16px monospace';
    ctx.fillText('Score: '+Math.floor(score), canvas.width/2 - 40, canvas.height/2 + 20);
    ctx.fillText('Press R to restart', canvas.width/2 - 70, canvas.height/2 + 50);
  }
}

function resetGame(){
  // reset runtime state
  obstacles.length = 0;
  lives = 3;
  invulTimer = 0;
  score = 0;
  elapsedTime = 0;
  running = true;
  console.log('resetGame called');
}
// expose for debugging
window.resetGame = resetGame;

function loop(now){
  const frameTime = now - last;
  last = now;
  accumulator += frameTime;
  while(accumulator >= TICK){
    update(TICK/1000);
    accumulator -= TICK;
  }
  render(accumulator / TICK);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
