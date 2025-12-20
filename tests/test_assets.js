const assert = require('assert');
const { AssetLoader } = require('../src/assetLoader.cjs');

// Test 1: Basic registration and pixelated flag
const loader = new AssetLoader({ pixelated: true });
loader.register('car', 'assets/images/car.png');
loader.register('bg', 'assets/images/bg.png');

assert.strictEqual(loader.pixelated, true, 'pixelated flag should be true');
let car = loader.get('car');
assert.ok(car && !car.loaded, 'registered asset should not be loaded initially');

// Test 2: loadAll should resolve and mark assets loaded
(async ()=>{
  const loaded = await loader.loadAll();
  assert.strictEqual(Array.isArray(loaded), true);
  assert.strictEqual(loaded.length, 2);
  loaded.forEach(a => { assert.strictEqual(a.loaded, true); assert.ok(a.data); });

  // Test 3: Metadata storage
  const loader2 = new AssetLoader();
  loader2.register('sprite', 'path/to/sprite.svg', { width: 192, height: 128, frames: 3 });
  const sprite = loader2.get('sprite');
  assert.ok(sprite.metadata, 'Asset should have metadata');
  assert.strictEqual(sprite.metadata.width, 192, 'Metadata width should be 192');
  assert.strictEqual(sprite.metadata.height, 128, 'Metadata height should be 128');
  assert.strictEqual(sprite.metadata.frames, 3, 'Metadata frames should be 3');

  // Test 4: Manifest loading
  const loader3 = new AssetLoader();
  const manifest = await loader3.loadManifest('assets/manifest.json');
  assert.ok(manifest, 'Manifest should be loaded');
  assert.strictEqual(manifest.version, '1.0.0', 'Manifest version should be 1.0.0');
  assert.ok(Array.isArray(manifest.assets), 'Manifest should have assets array');
  assert.ok(manifest.assets.length > 0, 'Manifest should have at least one asset');

  // Verify assets were registered from manifest
  const carSprite = loader3.get('car-sprite');
  assert.ok(carSprite, 'car-sprite should be registered from manifest');
  assert.strictEqual(carSprite.path, 'assets/images/car-sprite.svg', 'car-sprite path should match manifest');
  assert.strictEqual(carSprite.metadata.frames, 3, 'car-sprite should have 3 frames from metadata');
  assert.strictEqual(carSprite.metadata.width, 192, 'car-sprite width should be 192');

  const obstacleSprite = loader3.get('obstacle-sprite');
  assert.ok(obstacleSprite, 'obstacle-sprite should be registered from manifest');

  // Test 5: Progress reporting
  const loader4 = new AssetLoader();
  loader4.register('asset1', 'path1.png');
  loader4.register('asset2', 'path2.png');
  loader4.register('asset3', 'path3.png');

  let progressCalls = 0;
  let lastProgress = null;

  await loader4.loadAllWithProgress((progress) => {
    progressCalls++;
    lastProgress = progress;

    assert.ok(progress.loaded <= progress.total, 'loaded should not exceed total');
    assert.ok(progress.percentage >= 0 && progress.percentage <= 100, 'percentage should be 0-100');
    assert.ok(progress.currentAsset, 'currentAsset should be defined');
  });

  assert.ok(progressCalls > 0, 'Progress callback should be called at least once');
  assert.strictEqual(lastProgress.loaded, 3, 'Final loaded count should be 3');
  assert.strictEqual(lastProgress.total, 3, 'Total should be 3');
  assert.strictEqual(lastProgress.percentage, 100, 'Final percentage should be 100');

  // Verify all assets are loaded
  assert.strictEqual(loader4.get('asset1').loaded, true, 'asset1 should be loaded');
  assert.strictEqual(loader4.get('asset2').loaded, true, 'asset2 should be loaded');
  assert.strictEqual(loader4.get('asset3').loaded, true, 'asset3 should be loaded');

  console.log('test_assets: all assertions passed');
})();
