// About screen: shared HTML overlay opened from the title screen and from both pause menus.
import { VERSION } from './version.js';
import { createOverlay } from './overlay.js';

const el = document.getElementById('about');
const closeBtn = el.querySelector('.about-close');
const overlay = createOverlay(el);

el.querySelector('.about-version').textContent = `v${VERSION}`;
closeBtn.addEventListener('click', () => overlay.close());

export const isAboutOpen = overlay.isOpen;
export const closeAbout = overlay.close;

export function openAbout({ onClose } = {}){
  overlay.open({ onClose, focus: closeBtn });
}
