// Simple SoundLoader stub for unit tests; in browser would use Audio()
class SoundLoader {
  constructor(){
    this.sounds = new Map();
  }
  register(name, path){ this.sounds.set(name, { name, path, loaded:false }); }
  loadAll(){
    const entries = Array.from(this.sounds.values());
    return Promise.all(entries.map(e=> new Promise(resolve=>{ setTimeout(()=>{ e.loaded=true; resolve(e); },5); })));
  }
  get(name){ return this.sounds.get(name); }
}

function fadeValue(start, end, t){
  // t in [0,1]
  if(t<=0) return start; if(t>=1) return end;
  return start + (end-start)*t;
}

module.exports = { SoundLoader, fadeValue };
