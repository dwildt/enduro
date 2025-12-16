import Car from './entities/Car.js';
import SpriteAnimation from './SpriteAnimation.js';
import SoundManager from './SoundManager.js';

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

// Obstacles for browser runtime
import Obstacle from './entities/Obstacle.js';
import { LevelManager } from './levelManager.js';
const obstacles = []; // active obstacles array

const levelManager = new LevelManager();
let phaseOverlayTimer = 0;

// Pickups for browser runtime
import Pickup from './entities/Pickup.js';
const pickups = []; // active pickups array
let pickupSpawnTimer = 0; // accumulates time between spawns
const pickupSpawnInterval = 10; // spawn every 10 seconds

// Power-up effect state
let powerUpType = null; // 'invuln' or 'scoreboost' or null
let powerUpTimer = 0; // seconds remaining
let prevPowerUpTimer = 0; // for detecting timer threshold crossings
const invulnDuration = 5; // 5 seconds of invulnerability
const scoreBoostDuration = 8; // 8 seconds of 2x score
const scoreMultiplier = 2; // 2x multiplier when active

// sprite images (8-bit SVGs)
const carImg = new Image();
let carImgLoaded = false;
carImg.onload = () => { carImgLoaded = true; };
carImg.src = 'assets/images/car.svg';

const obstacleImg = new Image();
let obstacleImgLoaded = false;
obstacleImg.onload = () => { obstacleImgLoaded = true; };
obstacleImg.src = 'assets/images/obstacle.svg';

// Sprite animations
const carAnimation = new SpriteAnimation({
  imagePath: 'assets/images/car-sprite.svg',
  frameWidth: 64,
  frameHeight: 128,
  frameCount: 4,
  fps: 10,
  loop: true
});

const obstacleAnimation = new SpriteAnimation({
  imagePath: 'assets/images/obstacle-sprite.svg',
  frameWidth: 64,
  frameHeight: 128,
  frameCount: 3,
  fps: 8,
  loop: true
});

// Load animations
carAnimation.load();
obstacleAnimation.load();

// Create car with animation
const car = new Car(1, lanePositions, carAnimation);

// Sound manager
const soundManager = new SoundManager();

// Lives and invulnerability for browser
let lives = 3;
let invulTimer = 0; // seconds
const invulSeconds = 1.5;

// Score and timer (simple in-main manager)
let score = 0;
/* eslint-disable-next-line no-unused-vars */
let elapsedTime = 0; // tracked but not currently displayed in HUD
const pointsPerSec = 10;

// Game state
let running = true;
let paused = false;
let flashTimer = 0; // visual flash on hit

let last = performance.now();
const TICK = 1000/60;
let accumulator = 0;

// Input handling
const inputState = { left:false, right:false };
window.addEventListener('keydown', (e) => {
  // Initialize audio on first keypress (browser requirement)
  if (!soundManager.audioContext) {
    soundManager.init();
  }

  // Mute toggle: M for SFX
  if(e.key === 'm' || e.key === 'M') {
    soundManager.setSfxMuted(!soundManager.isSfxMuted());
    return;
  }

  // Engine toggle: E
  if(e.key === 'e' || e.key === 'E') {
    soundManager.setEngineMuted(!soundManager.isEngineMuted());
    if (!soundManager.isEngineMuted() && running && !paused) {
      const isBoosted = powerUpType === 'scoreboost';
      soundManager.startEngine(isBoosted);
    } else if (soundManager.isEngineMuted()) {
      soundManager.stopEngine();
    }
    return;
  }

  // Pause toggle: Space or P
  if(e.key === 'p' || e.key === 'P' || e.key === ' ') {
    if(!running) return; // don't pause when game over
    paused = !paused;
    return;
  }
  // When paused ignore input
  if(paused) return;
  if(e.key === 'ArrowLeft' || e.key === 'a') {
    inputState.left = true;
    car.moveLeft();
    soundManager.playLaneChange();
  }
  if(e.key === 'ArrowRight' || e.key === 'd') {
    inputState.right = true;
    car.moveRight();
    soundManager.playLaneChange();
  }
});
window.addEventListener('keyup', (e) => {
  if(e.key === 'ArrowLeft' || e.key === 'a') { inputState.left = false; }
  if(e.key === 'ArrowRight' || e.key === 'd') { inputState.right = false; }
  if(e.key === 'r' || e.key === 'R') {
    // restart on R
    resetGame();
  }
});

// Pointer / click zones - includes mobile audio controls
canvas.addEventListener('pointerdown', (ev) => {
  const rect = canvas.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const y = ev.clientY - rect.top;

  // Initialize audio on first touch if needed
  if (!soundManager.audioContext) {
    soundManager.init();
  }

  // SFX button bounds (upper right, first row)
  const sfxBtnX = canvas.width - 82;
  const sfxBtnY = 40;
  const sfxBtnW = 39;
  const sfxBtnH = 20;

  // Engine button bounds (upper right, second row)
  const engineBtnX = canvas.width - 82;
  const engineBtnY = 55;
  const engineBtnW = 39;
  const engineBtnH = 20;

  // Check if tapped SFX button
  if (x >= sfxBtnX && x <= sfxBtnX + sfxBtnW &&
      y >= sfxBtnY && y <= sfxBtnY + sfxBtnH) {
    soundManager.setSfxMuted(!soundManager.isSfxMuted());
    ev.preventDefault();
    return;
  }

  // Check if tapped Engine button
  if (x >= engineBtnX && x <= engineBtnX + engineBtnW &&
      y >= engineBtnY && y <= engineBtnY + engineBtnH) {
    soundManager.setEngineMuted(!soundManager.isEngineMuted());
    if (!soundManager.isEngineMuted() && running && !paused) {
      const isBoosted = powerUpType === 'scoreboost';
      soundManager.startEngine(isBoosted);
    } else if (soundManager.isEngineMuted()) {
      soundManager.stopEngine();
    }
    ev.preventDefault();
    return;
  }

  // Existing lane change logic (only if not tapping buttons and game is running)
  if(paused || !running) return;
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
  const multiplier = (powerUpType === 'scoreboost') ? scoreMultiplier : 1;
  score += pointsPerSec * dt * multiplier;

  // level manager update (returns true on transition)
  const transitioned = levelManager.update(dt);
  if(transitioned){
    phaseOverlayTimer = 2;
    soundManager.playCheckpoint();
  }

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
      obstacles.push(new Obstacle(lane, lanePositions, spawnY, speed, obstacleAnimation));
    }
  }

  // update obstacles
  obstacles.forEach(o => o.update(dt));
  // remove offscreen
  for(let i = obstacles.length - 1; i >= 0; i--){
    if(obstacles[i].isOffscreen(canvas.height)) obstacles.splice(i,1);
  }

  // Pickup spawning
  pickupSpawnTimer += dt;
  if(pickupSpawnTimer >= pickupSpawnInterval){
    pickupSpawnTimer = 0;
    const lane = Math.floor(Math.random() * lanePositions.length);
    const type = Math.random() < 0.5 ? 'invuln' : 'scoreboost';
    pickups.push(new Pickup(type, lane, lanePositions, -60));
  }

  // Update pickups
  pickups.forEach(p => p.update(dt));
  // Remove offscreen pickups
  for(let i = pickups.length - 1; i >= 0; i--){
    if(pickups[i].isOffscreen(canvas.height)) pickups.splice(i,1);
  }

  // invulnerability update
  if(invulTimer > 0){ invulTimer = Math.max(0, invulTimer - dt); }
  if(flashTimer > 0){ flashTimer = Math.max(0, flashTimer - dt); }

  // Power-up timer update
  if(powerUpTimer > 0){
    // Timer beep at 3s, 2s, 1s remaining
    for(const threshold of [3, 2, 1]){
      if(prevPowerUpTimer > threshold && powerUpTimer <= threshold){
        soundManager.playTimerBeep();
        break;
      }
    }

    powerUpTimer = Math.max(0, powerUpTimer - dt);
  }
  prevPowerUpTimer = powerUpTimer;

  // Update engine boost when power-up changes
  const isBoosted = powerUpType === 'scoreboost';
  soundManager.updateEngineBoost(isBoosted);

  if(powerUpTimer <= 0){ powerUpType = null; }

  // collision checks
  // Only check collision if not invulnerable from hit OR power-up
  if(invulTimer <= 0 && powerUpType !== 'invuln'){
    for(const o of obstacles){
      const collided = aabbOverlap(car.x - 16, car.y - 24, 32, 48, o.x - o.width/2, o.y - o.height/2, o.width, o.height);
      if(collided){
        lives = Math.max(0, lives - 1);
        invulTimer = invulSeconds;
        flashTimer = 0.3;
        soundManager.playHit();
        // vibrate if available
        if(navigator.vibrate) navigator.vibrate(100);
        console.log('Hit! lives=', lives);
        if(lives <= 0){
          running = false;
          soundManager.playGameOver();
          soundManager.stopEngine();
        }
        break;
      }
    }
  }

  // Pickup collision detection
  for(let i = pickups.length - 1; i >= 0; i--){
    const p = pickups[i];
    const collided = aabbOverlap(
      car.x - 16, car.y - 24, 32, 48,
      p.x - p.width/2, p.y - p.height/2, p.width, p.height
    );
    if(collided){
      // Apply power-up effect
      powerUpType = p.type;
      powerUpTimer = p.type === 'invuln' ? invulnDuration : scoreBoostDuration;
      prevPowerUpTimer = powerUpTimer;
      soundManager.playPowerUp();

      // Update engine sound when getting boost
      if(p.type === 'scoreboost'){
        soundManager.updateEngineBoost(true);
      }

      pickups.splice(i, 1); // Remove collected pickup
      break;
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
    if(o.animation && o.animation.isLoaded()){
      // Draw animated sprite
      const frame = o.animation.getCurrentFrame();
      ctx.drawImage(
        o.animation.image,
        frame.x, frame.y, frame.width, frame.height,
        o.x - o.width/2, o.y - o.height/2, o.width, o.height
      );
      // Apply speed-based tint overlay
      let tint;
      if(speed < 100) tint = 'rgba(100, 255, 100, 0.3)'; // greenish for slow
      else if(speed < 150) tint = 'rgba(255, 255, 100, 0.3)'; // yellowish for medium
      else tint = 'rgba(255, 100, 100, 0.3)'; // reddish for fast
      ctx.fillStyle = tint;
      ctx.fillRect(o.x - o.width/2, o.y - o.height/2, o.width, o.height);
    } else if(obstacleImgLoaded){
      // Fallback to static image
      ctx.drawImage(obstacleImg, o.x - o.width/2, o.y - o.height/2, o.width, o.height);
      // Apply speed-based tint overlay
      let tint;
      if(speed < 100) tint = 'rgba(100, 255, 100, 0.3)';
      else if(speed < 150) tint = 'rgba(255, 255, 100, 0.3)';
      else tint = 'rgba(255, 100, 100, 0.3)';
      ctx.fillStyle = tint;
      ctx.fillRect(o.x - o.width/2, o.y - o.height/2, o.width, o.height);
    } else {
      // Fallback to colored rectangle
      if(speed < 100) ctx.fillStyle = '#5f5';
      else if(speed < 150) ctx.fillStyle = '#ff5';
      else ctx.fillStyle = '#f55';
      ctx.fillRect(o.x - o.width/2, o.y - o.height/2, o.width, o.height);
    }
  });

  // Draw pickups
  pickups.forEach(p=>{
    const color = p.type === 'invuln' ? '#00f' : '#f90'; // blue or orange
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.width/2, 0, Math.PI * 2);
    ctx.fill();
    // Add glow effect
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  // draw player car as image when available
  const carW = 32;
  const carH = 48;
  if(car.animation && car.animation.isLoaded()){
    const frame = car.animation.getCurrentFrame();
    ctx.drawImage(
      car.animation.image,
      frame.x, frame.y, frame.width, frame.height,
      car.x - carW/2, car.y - carH/2, carW, carH
    );
  } else if(carImgLoaded){
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

  // Audio indicators (upper right, below lives)
  // SFX indicator
  ctx.fillStyle = soundManager.isSfxMuted() ? '#666' : '#0f0';
  ctx.font = '12px monospace';
  const sfxText = soundManager.isSfxMuted() ? '[M] OFF' : '[M] ON';
  ctx.fillText(sfxText, canvas.width - 80, 58);

  // Engine indicator
  ctx.fillStyle = soundManager.isEngineMuted() ? '#666' : '#fa0';
  const engineText = soundManager.isEngineMuted() ? '[E] OFF' : '[E] ON';
  ctx.fillText(engineText, canvas.width - 80, 72);

  // Mobile touch controls - visual borders around buttons
  const sfxBtnX = canvas.width - 80;
  const sfxBtnY = 52;
  const sfxBtnW = 35;
  const sfxBtnH = 18;

  const engineBtnX = canvas.width - 80;
  const engineBtnY = 67;
  const engineBtnW = 35;
  const engineBtnH = 18;

  // Draw button backgrounds (subtle borders for touch targets)
  ctx.strokeStyle = soundManager.isSfxMuted() ? '#666' : '#0f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(sfxBtnX - 2, sfxBtnY - 12, sfxBtnW + 4, sfxBtnH + 2);

  ctx.strokeStyle = soundManager.isEngineMuted() ? '#666' : '#fa0';
  ctx.strokeRect(engineBtnX - 2, engineBtnY - 12, engineBtnW + 4, engineBtnH + 2);

  // Power-up indicator
  if(powerUpType){
    const label = powerUpType === 'invuln' ? 'SHIELD' : 'BOOST';
    const color = powerUpType === 'invuln' ? '#00f' : '#f90';
    ctx.fillStyle = color;
    ctx.font = '14px monospace';
    const timerText = `${label}: ${Math.ceil(powerUpTimer)}s`;
    ctx.fillText(timerText, canvas.width/2 - 40, 44);
  }

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
  pickups.length = 0;
  lives = 3;
  invulTimer = 0;
  powerUpType = null;
  powerUpTimer = 0;
  prevPowerUpTimer = 0;
  pickupSpawnTimer = 0;
  score = 0;
  elapsedTime = 0;
  running = true;
  soundManager.stopEngine();
  if (!soundManager.isEngineMuted()) {
    soundManager.startEngine(false);
  }
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

// Engine will start automatically when user presses E key or on game reset
