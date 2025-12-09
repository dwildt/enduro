import { hello } from './utils.js';
import Car from './entities/Car.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Lane positions match Car default
const lanePositions = [80, 240, 400];
const car = new Car(1, lanePositions);

// Obstacles for browser runtime
import Obstacle from './entities/Obstacle.js';
const obstacles = []; // active obstacles array
const spawnRate = 0.9; // per second
let spawnAccumulator = 0; // reserved for future rate logic

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
let flashTimer = 0; // visual flash on hit

let last = performance.now();
const TICK = 1000/60;
let accumulator = 0;

// Input handling
const inputState = { left:false, right:false };
window.addEventListener('keydown', (e) => {
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
  const rect = canvas.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  if(x < canvas.width/2) car.moveLeft(); else car.moveRight();
});

function aabbOverlap(ax, ay, aw, ah, bx, by, bw, bh){
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function update(dt){
  if(!running) return;
  // dt in seconds
  car.update(dt);

  // scoring/time
  elapsedTime += dt;
  score += pointsPerSec * dt;

  // spawn logic
  spawnAccumulator += dt;
  // use probability per frame
  if(Math.random() < spawnRate * dt){
    const lane = Math.floor(Math.random() * lanePositions.length);
    obstacles.push(new Obstacle(lane, lanePositions, -60, 120 + Math.random() * 60));
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
  // background
  ctx.fillStyle = '#222';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // road
  const roadX = 64;
  const roadW = canvas.width - 128;
  ctx.fillStyle = '#2b2b2b';
  ctx.fillRect(roadX, 32, roadW, canvas.height - 64);

  // lane dividers
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 4;
  const lanes = lanePositions.length;
  for(let i=1;i<lanes;i++){
    const x = (lanePositions[i-1] + lanePositions[i]) / 2;
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.lineTo(x, canvas.height - 40);
    ctx.stroke();
  }

  // draw obstacles
  obstacles.forEach(o=>{
    if(obstacleImgLoaded){
      ctx.drawImage(obstacleImg, o.x - o.width/2, o.y - o.height/2, o.width, o.height);
    } else {
      ctx.fillStyle = '#f55';
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

  // HUD
  ctx.fillStyle = '#0f0';
  ctx.font = '16px monospace';
  ctx.fillText(hello(), 10, 20);
  ctx.fillText('Lives: '+lives, 360, 20);
  ctx.fillText('Score: '+Math.floor(score), 200, 20);

  // flash effect
  if(flashTimer > 0){
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
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
