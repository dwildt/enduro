// Simple AssetLoader that registers asset entries and simulates loading in Node tests.
class AssetLoader {
  constructor({ pixelated = true } = {}){
    this.pixelated = !!pixelated;
    this.assets = new Map();
  }

  register(name, path, metadata = {}){
    this.assets.set(name, { name, path, loaded: false, data: null, metadata });
  }

  // Load manifest from JSON file
  async loadManifest(manifestPath){
    let manifest;

    // In Node.js (tests), use fs.readFileSync
    if(typeof window === 'undefined'){
      const fs = require('fs');
      const content = fs.readFileSync(manifestPath, 'utf-8');
      manifest = JSON.parse(content);
    } else {
      // In browser, use fetch
      const response = await fetch(manifestPath);
      manifest = await response.json();
    }

    // Register all assets from manifest
    for(const asset of manifest.assets){
      const { name, path, ...metadata } = asset;
      this.register(name, path, metadata);
    }

    return manifest;
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

  // Load all assets with progress reporting
  loadAllWithProgress(onProgress){
    const entries = Array.from(this.assets.values());
    const total = entries.length;
    let loaded = 0;

    const promises = entries.map((entry) => {
      return new Promise(resolve => {
        setTimeout(()=>{
          entry.loaded = true;
          entry.data = { placeholder: true, path: entry.path };
          loaded++;

          if(onProgress){
            onProgress({
              loaded,
              total,
              percentage: (loaded / total) * 100,
              currentAsset: entry.name
            });
          }

          resolve(entry);
        }, 5);
      });
    });

    return Promise.all(promises);
  }

  get(name){
    return this.assets.get(name);
  }
}

module.exports = { AssetLoader };
