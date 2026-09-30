// About screen: shared HTML overlay opened from the title screen and from both pause menus.
// While open it captures the keyboard, so the title menu and the game never see those keys.
import { VERSION } from './version.js';

const overlay = document.getElementById('about');
const closeBtn = overlay.querySelector('.about-close');
const focusables = () => Array.from(overlay.querySelectorAll('a, button'));
let onCloseCallback = null;
let returnFocus = null;

overlay.querySelector('.about-version').textContent = `v${VERSION}`;

export function isAboutOpen(){ return !overlay.hidden; }

export function openAbout({ onClose } = {}){
  if(isAboutOpen()) return;
  onCloseCallback = onClose || null;
  returnFocus = document.activeElement;
  overlay.hidden = false;
  overlay.scrollTop = 0;
  closeBtn.focus({ preventScroll: true });
  window.addEventListener('keydown', onKey, true);
}

export function closeAbout(){
  if(!isAboutOpen()) return;
  overlay.hidden = true;
  window.removeEventListener('keydown', onKey, true);
  if(returnFocus && returnFocus.focus) returnFocus.focus();
  const cb = onCloseCallback;
  onCloseCallback = null;
  if(cb) cb();
}

function moveFocus(step){
  const items = focusables();
  const i = items.indexOf(document.activeElement);
  items[(i + step + items.length) % items.length].focus();
}

function onKey(e){
  e.stopImmediatePropagation();
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  const active = document.activeElement;
  if(k === 'Tab') return; // native focus order
  if(k === 'Escape') closeAbout();
  else if(k === 'ArrowUp' || k === 'ArrowLeft' || k === 'w' || k === 'a') moveFocus(-1);
  else if(k === 'ArrowDown' || k === 'ArrowRight' || k === 's' || k === 'd') moveFocus(1);
  else if(k === 'Enter' || k === ' '){
    if(active && active.tagName === 'A' && overlay.contains(active)) active.click();
    else closeAbout();
  }
  else return;
  e.preventDefault();
}

closeBtn.addEventListener('click', closeAbout);
// a click on the dimmed backdrop (outside the card) also closes
overlay.addEventListener('click', (e) => { if(e.target === overlay) closeAbout(); });
