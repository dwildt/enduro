// Shared behavior of the HTML overlays (About, Settings) shown over the game screen:
// while open they capture the keyboard, so the title menu and the game never see those keys.
export function createOverlay(el){
  let onCloseCallback = null;
  let returnFocus = null;
  const focusables = () => Array.from(el.querySelectorAll('a, button')).filter(item => !item.hidden);

  function isOpen(){ return !el.hidden; }

  function open({ onClose, focus } = {}){
    if(isOpen()) return;
    onCloseCallback = onClose || null;
    returnFocus = document.activeElement;
    el.hidden = false;
    el.scrollTop = 0;
    (focus || focusables()[0]).focus({ preventScroll: true });
    window.addEventListener('keydown', onKey, true);
  }

  function close(){
    if(!isOpen()) return;
    el.hidden = true;
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
    if(k === 'Escape') close();
    else if(k === 'ArrowUp' || k === 'ArrowLeft' || k === 'w' || k === 'a') moveFocus(-1);
    else if(k === 'ArrowDown' || k === 'ArrowRight' || k === 's' || k === 'd') moveFocus(1);
    else if(k === 'Enter' || k === ' '){
      if(active && el.contains(active)) active.click();
      else close();
    }
    else return;
    e.preventDefault();
  }

  // a click on the dimmed backdrop (outside the card) also closes
  el.addEventListener('click', (e) => { if(e.target === el) close(); });

  return { open, close, isOpen };
}
