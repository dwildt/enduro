import { hello } from './utils.js';
import Car from './entities/Car.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Lane positions match Car default
const lanePositions = [80, 240, 400];
const car = new Car(1, lanePositions);

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
});

// Pointer / click zones
canvas.addEventListener('pointerdown', (ev) => {
  const rect = canvas.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  if(x < canvas.width/2) car.moveLeft(); else car.moveRight();
});

function update(dt){
  // dt in seconds
  car.update(dt);
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

  // draw player car as simple rectangle
  const carW = 32;
  const carH = 48;
  ctx.fillStyle = '#0ff';
  ctx.fillRect(car.x - carW/2, car.y - carH/2, carW, carH);

  // HUD
  ctx.fillStyle = '#0f0';
  ctx.font = '16px monospace';
  ctx.fillText(hello(), 10, 20);
}

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
