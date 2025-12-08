const assert = require('assert');
const { AssetLoader } = require('../src/assetLoader.cjs');

const loader = new AssetLoader({ pixelated: true });
loader.register('car', 'assets/images/car.png');
loader.register('bg', 'assets/images/bg.png');

assert.strictEqual(loader.pixelated, true, 'pixelated flag should be true');
let car = loader.get('car');
assert.ok(car && !car.loaded, 'registered asset should not be loaded initially');

// loadAll should resolve and mark assets loaded
(async ()=>{
  const loaded = await loader.loadAll();
  assert.strictEqual(Array.isArray(loaded), true);
  assert.strictEqual(loaded.length, 2);
  loaded.forEach(a => { assert.strictEqual(a.loaded, true); assert.ok(a.data); });
  console.log('test_assets: all assertions passed');
})();
