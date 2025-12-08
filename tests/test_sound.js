const assert = require('assert');
const { SoundLoader, fadeValue } = require('../src/sound.cjs');

const sl = new SoundLoader();
sl.register('crash','assets/sfx/crash.wav');
sl.register('beep','assets/sfx/beep.wav');
(async ()=>{
  const loaded = await sl.loadAll();
  assert.strictEqual(loaded.length, 2);
  loaded.forEach(s=>assert.strictEqual(s.loaded,true));
  assert.strictEqual(fadeValue(0,1,0),0);
  assert.strictEqual(fadeValue(0,1,1),1);
  assert.strictEqual(Math.abs(fadeValue(0,1,0.5)-0.5)<1e-6,true);
  console.log('test_sound: all assertions passed');
})();
