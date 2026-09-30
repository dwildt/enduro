// OutRun mode entry point: Pixi app, fixed-step loop, state machine and input.
import { Application, Container, Graphics, TextureStyle } from 'pixi.js';
import { buildTrack, getTheme } from './track.js';
import { World, SPEED_PER_BASE } from './world.js';
import { OutRunRenderer, WIDTH, HEIGHT } from './OutRunRenderer.js';
import { Hud, label, FONT } from './hud.js';
import { Screens, COLORS, saveScore, PAUSE_OPTIONS, GAME_OVER_OPTIONS, menuBounds } from './screens.js';
import SoundManager from '../SoundManager.js';
import MusicSequencer from '../audio/MusicSequencer.js';
import { TRACKS } from '../audio/tracks.js';

const TICK = 1 / 60;
const THEME_FADE_SECONDS = 2;

function isTouchLayout(){
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
}

export async function startOutRun(root){
  try { await document.fonts.load(`8px ${FONT}`); } catch(_e){ /* fallback font */ }
  TextureStyle.defaultOptions.scaleMode = 'nearest';

  const app = new Application();
  await app.init({ width: WIDTH, height: HEIGHT, background: 0x000000, antialias: false, resolution: 1, roundPixels: true });
  root.appendChild(app.canvas);

  // the arcade cabinet CSS sizes the canvas (pixelated upscaling of the 320x224 Mega Drive resolution)
  const crt = document.createElement('div');
  crt.className = 'crt';
  root.appendChild(crt);
  let crtOn = localStorage.getItem('enduro_crt') !== 'false';
  crt.hidden = !crtOn;

  const road = buildTrack();
  const world = new World(road);
  const renderer = new OutRunRenderer(app.stage, road);
  const hud = new Hud(app.stage);
  const screens = new Screens(app.stage);
  const touch = createTouchButtons(app.stage);
  const sound = new SoundManager();
  const music = new MusicSequencer();

  let colorIndex = Math.max(0, COLORS.indexOf(localStorage.getItem('enduro_car_color')));
  let trackIndex = Math.min(TRACKS.length - 1, Number(localStorage.getItem('enduro_radio')) || 0);
  let state = 'color'; // color | radio | race | paused | gameover
  let theme = { from: 1, to: 1, t: 1 };
  let time = 0;
  let screenKey = '';
  let lastRank = -1;
  let menuIndex = 0; // selected option in the pause / game over menus

  const menuOptions = () => (state === 'paused' ? PAUSE_OPTIONS : state === 'gameover' ? GAME_OVER_OPTIONS : null);

  function applyCarColor(){
    renderer.setCarColor(COLORS[colorIndex]);
    hud.setLifeTexture(renderer.carFrames['0']);
  }
  applyCarColor();

  function initAudio(){
    if(sound.audioContext) return;
    sound.init();
    music.attach(sound.audioContext);
  }

  function setState(next){
    state = next;
    screenKey = '';
    menuIndex = 0;
    if(next === 'race' && !sound.isEngineMuted()) sound.startEngine(false);
    if(next !== 'race') sound.stopEngine();
    if(next === 'radio') music.play(TRACKS[trackIndex]);
    if(next === 'paused' || next === 'color' || next === 'gameover') music.stop();
  }

  function startRace(){
    localStorage.setItem('enduro_car_color', COLORS[colorIndex]);
    localStorage.setItem('enduro_radio', String(trackIndex));
    world.reset();
    theme = { from: 1, to: 1, t: 1 };
    hud.banner(getTheme(1).name, 'GET READY... GO!', 2.5);
    music.play(TRACKS[trackIndex]);
    setState('race');
  }

  function toggleEngine(){
    sound.setEngineMuted(!sound.isEngineMuted());
    if(!sound.isEngineMuted() && state === 'race') sound.startEngine(false);
  }

  function onEvents(events){
    for(const e of events){
      if(e === 'hit'){ sound.playHit(); hud.hit(); if(navigator.vibrate) navigator.vibrate(100); }
      if(e === 'powerup') sound.playPowerUp();
      if(e === 'beep') sound.playTimerBeep();
      if(e === 'skid') sound.playSkid();
      if(e === 'checkpoint'){
        const id = world.levelManager.getCurrentPhase().id;
        theme = { from: theme.to, to: id, t: 0 };
        hud.banner('CHECKPOINT!', getTheme(id).name, 2.5);
        sound.playCheckpoint();
      }
      if(e === 'gameover'){
        sound.playGameOver();
        lastRank = saveScore(world.score, world.levelManager.getCurrentPhase().id);
        setState('gameover');
      }
    }
  }

  // --- input ---
  const actions = {
    prev(){ const m = menuOptions(); if(m) menuIndex = (menuIndex + m.length - 1) % m.length; },
    next(){ const m = menuOptions(); if(m) menuIndex = (menuIndex + 1) % m.length; },
    left(){
      if(menuOptions()) actions.prev();
      else if(state === 'race'){ if(world.moveLeft()) sound.playLaneChange(); }
      else if(state === 'color'){ colorIndex = (colorIndex + COLORS.length - 1) % COLORS.length; applyCarColor(); }
      else if(state === 'radio'){ trackIndex = (trackIndex + TRACKS.length - 1) % TRACKS.length; music.play(TRACKS[trackIndex]); }
    },
    right(){
      if(menuOptions()) actions.next();
      else if(state === 'race'){ if(world.moveRight()) sound.playLaneChange(); }
      else if(state === 'color'){ colorIndex = (colorIndex + 1) % COLORS.length; applyCarColor(); }
      else if(state === 'radio'){ trackIndex = (trackIndex + 1) % TRACKS.length; music.play(TRACKS[trackIndex]); }
    },
    confirm(){
      if(state === 'color') setState('radio');
      else if(state === 'radio') startRace();
      else if(menuOptions()) actions.select(menuOptions()[menuIndex]);
    },
    select(option){
      if(option === 'CONTINUE'){ setState('race'); music.play(TRACKS[trackIndex]); }
      else if(option === 'RESTART' || option === 'CAR') setState('color');
      else if(option === 'RETRY') startRace();
      else if(option === 'MENU') window.location.reload(); // back to the mode select screen
    },
    pause(){
      if(state === 'race') setState('paused');
      else if(state === 'paused') actions.select('CONTINUE');
    }
  };

  window.addEventListener('keydown', (e) => {
    initAudio();
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if(k === 'ArrowLeft' || k === 'a') actions.left();
    else if(k === 'ArrowRight' || k === 'd') actions.right();
    else if(k === 'ArrowUp' || k === 'w') actions.prev();
    else if(k === 'ArrowDown' || k === 's') actions.next();
    else if(k === 'Enter') actions.confirm();
    else if(k === ' ') state === 'race' ? actions.pause() : actions.confirm();
    else if(k === 'p') actions.pause();
    else if(k === 'm') music.setMuted(!music.isMuted());          // M = music
    else if(k === 'e') toggleEngine();                            // E = engine
    else if(k === 'c') sound.setSfxMuted(!sound.isSfxMuted());    // C = car sounds (SFX)
    else if(k === 'v'){ crtOn = !crtOn; crt.hidden = !crtOn; localStorage.setItem('enduro_crt', String(crtOn)); }
    else if(k === 'Escape') window.location.reload(); // back to the mode select screen
    else return;
    e.preventDefault();
  });

  app.canvas.addEventListener('pointerdown', (ev) => {
    initAudio();
    const rect = app.canvas.getBoundingClientRect();
    const x = (ev.clientX - rect.left) / rect.width * WIDTH;
    const y = (ev.clientY - rect.top) / rect.height * HEIGHT;
    ev.preventDefault();
    if(state === 'race' && touch.container.visible){
      const hitBtn = touch.hit(x, y);
      if(hitBtn) actions[hitBtn]();
      return;
    }
    const menu = menuOptions();
    if(menu){
      const i = menuBounds(menu).findIndex(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
      if(i >= 0){ menuIndex = i; actions.select(menu[i]); }
      return;
    }
    if(x < WIDTH / 3) actions.left();
    else if(x > WIDTH * 2 / 3) actions.right();
    else if(state !== 'race') actions.confirm();
  });

  // --- loop ---
  let accumulator = 0;
  app.ticker.add((ticker) => {
    const frame = Math.min(0.25, ticker.deltaMS / 1000);
    time += frame;

    if(state === 'race'){
      accumulator += frame;
      while(accumulator >= TICK){
        onEvents(world.update(TICK));
        accumulator -= TICK;
        if(state !== 'race') break;
      }
      const boost = world.powerUpType === 'scoreboost' ? 0.3 : 0;
      sound.setEngineSpeed(Math.min(1, world.speed / (2 * SPEED_PER_BASE) + boost));
    } else if(state === 'color' || state === 'radio'){
      // attract mode: cruise along the road behind the menus
      world.speed = 3000;
      world.distance += world.speed * frame;
    }
    if(theme.t < 1){
      theme.t = Math.min(1, theme.t + frame / THEME_FADE_SECONDS);
      if(theme.t === 1) theme.from = theme.to;
    }

    renderer.render(world, frame, theme);
    hud.root.visible = state !== 'color' && state !== 'radio';
    hud.update(world, frame, { sfx: !sound.isSfxMuted(), engine: !sound.isEngineMuted(), music: !music.isMuted() }, time);
    touch.container.visible = state === 'race' && isTouchLayout();
    if(state !== 'race') hud.bannerTitle.visible = hud.bannerSub.visible = false; // don't cover menus

    // menus are rebuilt only when their content changes (a few times per second)
    const key = `${state}:${colorIndex}:${trackIndex}:${menuIndex}:${Math.floor(time * 4)}`;
    if(key !== screenKey){
      screenKey = key;
      if(state === 'color') screens.showColor(colorIndex, time);
      else if(state === 'radio') screens.showRadio(TRACKS, trackIndex, time);
      else if(state === 'paused') screens.showPause(menuIndex);
      else if(state === 'gameover') screens.showGameOver(world.score, lastRank, menuIndex);
      else screens.clear();
    }
  });
}

// on-screen buttons for phones/tablets: steer left/right and pause
function createTouchButtons(stage){
  const container = new Container();
  const size = 40, margin = 6;
  const buttons = {
    left: { x: margin, y: HEIGHT - size - margin - 30, text: '<' },
    right: { x: WIDTH - size - margin, y: HEIGHT - size - margin - 30, text: '>' },
    pause: { x: 8, y: 26, w: 28, h: 20, text: 'II' } // below SCORE, away from the car
  };
  for(const b of Object.values(buttons)){
    b.w = b.w || size;
    b.h = b.h || size;
    container.addChild(new Graphics().rect(b.x, b.y, b.w, b.h).fill({ color: 0x000000, alpha: 0.35 }).stroke({ color: 0x60e0ff, width: 2 }));
    label(container, b.text, b.x + b.w / 2, b.y + b.h / 2, { size: 8, color: 0x60e0ff, anchorX: 0.5, anchorY: 0.5 });
  }
  container.visible = false;
  stage.addChild(container);
  return {
    container,
    hit(x, y){
      return Object.keys(buttons).find(k => {
        const b = buttons[k];
        return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
      });
    }
  };
}
