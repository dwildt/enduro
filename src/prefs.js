// Player preferences (audio and CRT) saved in localStorage: one place for the keys and the defaults.
// Audio keys store "muted" ('true' = off), the CRT key stores "on"; the format predates this module.
export const PREFS = {
  music: { key: 'enduro_music_muted', inverted: true, default: true },
  engine: { key: 'enduro_engine_muted', inverted: true, default: true },
  sfx: { key: 'enduro_sfx_muted', inverted: true, default: true },
  crt: { key: 'enduro_crt', inverted: false, default: true }
};

function defaultStorage(){
  try { return globalThis.localStorage || null; } catch(_e){ return null; }
}

// true when the option is on
export function getPref(name, storage = defaultStorage()){
  const pref = PREFS[name];
  let raw = null;
  try { raw = storage.getItem(pref.key); } catch(_e){ /* storage unavailable */ }
  if(raw !== 'true' && raw !== 'false') return pref.default;
  return (raw === 'true') !== pref.inverted;
}

export function setPref(name, on, storage = defaultStorage()){
  const pref = PREFS[name];
  try { storage.setItem(pref.key, String(on !== pref.inverted)); } catch(_e){ /* storage unavailable */ }
}
