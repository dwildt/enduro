// Title screen: choose between the classic top-down game and the OutRun-style pseudo-3D mode (or open Settings/About)
import { openAbout } from './about.js';
import { openSettings } from './settings.js';

const MODES = ['classic', 'outrun', 'settings', 'about'];
const menu = document.getElementById('mode-select');
const buttons = Array.from(menu.querySelectorAll('button[data-mode]'));

let highlighted = Math.max(0, MODES.indexOf(localStorage.getItem('enduro_mode')));
let started = false;

function highlight(index){
  highlighted = (index + MODES.length) % MODES.length;
  buttons.forEach((b, i) => b.classList.toggle('active', i === highlighted));
}

async function start(mode){
  if(started) return;
  if(mode === 'about'){ openAbout(); return; }
  if(mode === 'settings'){ openSettings(); return; } // modes read the saved prefs when they load
  started = true;
  localStorage.setItem('enduro_mode', mode);
  window.removeEventListener('keydown', onKey);
  menu.hidden = true;
  // cabinet adapts its screen ratio and theme to the mode (see styles.css)
  document.getElementById('cabinet').dataset.mode = mode;
  document.querySelector('.marquee-mode').textContent = mode.toUpperCase();

  if(mode === 'classic'){
    // main.js grabs #game on load, so the canvas must be visible first
    document.getElementById('game').hidden = false;
    await import('./main.js');
  } else {
    const root = document.getElementById('outrun-root');
    root.hidden = false;
    const { startOutRun } = await import('./outrun/index.js');
    await startOutRun(root);
  }
}

function onKey(e){
  if(e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W'){ highlight(highlighted - 1); e.preventDefault(); }
  if(e.key === 'ArrowDown' || e.key === 's' || e.key === 'S'){ highlight(highlighted + 1); e.preventDefault(); }
  if(e.key === 'Enter' || e.key === ' '){ start(MODES[highlighted]); e.preventDefault(); }
}

buttons.forEach((b, i) => {
  b.addEventListener('click', () => start(MODES[i]));
  b.addEventListener('mouseenter', () => highlight(i));
});
window.addEventListener('keydown', onKey);

highlight(highlighted);
menu.hidden = false;
