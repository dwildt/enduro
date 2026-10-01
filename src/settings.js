// Settings screen: ON/OFF toggles for the preferences in prefs.js, opened from the title screen
// and from both pause menus. Each mode passes the options it uses and applies changes live via onChange.
import { getPref, setPref } from './prefs.js';
import { createOverlay } from './overlay.js';

export const ALL_OPTIONS = ['music', 'engine', 'sfx', 'crt'];

const el = document.getElementById('settings');
const toggles = Array.from(el.querySelectorAll('.toggle[data-pref]'));
const overlay = createOverlay(el);
let onChangeCallback = null;

function render(toggle){
  const on = getPref(toggle.dataset.pref);
  toggle.setAttribute('aria-pressed', String(on));
  toggle.querySelector('.state').textContent = on ? 'ON' : 'OFF';
}

toggles.forEach(toggle => toggle.addEventListener('click', () => {
  const name = toggle.dataset.pref;
  const on = !getPref(name);
  setPref(name, on);
  render(toggle);
  if(onChangeCallback) onChangeCallback(name, on);
}));
el.querySelector('.settings-back').addEventListener('click', () => overlay.close());

export const isSettingsOpen = overlay.isOpen;

export function openSettings({ options = ALL_OPTIONS, onChange, onClose } = {}){
  onChangeCallback = onChange || null;
  toggles.forEach(toggle => {
    toggle.hidden = !options.includes(toggle.dataset.pref);
    render(toggle);
  });
  overlay.open({ onClose: () => { onChangeCallback = null; if(onClose) onClose(); } });
}
