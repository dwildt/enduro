// Simple AssetLoader that registers asset entries and simulates loading in Node tests.
class AssetLoader {
  constructor({ pixelated = true } = {}){
    this.pixelated = !!pixelated;
    this.assets = new Map();
  }

  register(name, path){
    this.assets.set(name, { name, path, loaded: false, data: null });
  }

  // In browser this would create Image() objects; in Node tests we simulate load
  loadAll(){
    const entries = Array.from(this.assets.values());
    return Promise.all(entries.map(entry => {
      // simulated async load
      return new Promise(resolve => {
        setTimeout(()=>{
          entry.loaded = true;
          entry.data = { placeholder: true, path: entry.path };
          resolve(entry);
        }, 5);
      });
    }));
  }

  get(name){
    return this.assets.get(name);
  }
}

module.exports = { AssetLoader };
