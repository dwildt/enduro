import assert from 'assert';
import { PREFS, getPref, setPref } from '../src/prefs.js';

function memoryStorage(initial = {}){
  const data = { ...initial };
  return { getItem: k => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = String(v); }, data };
}

// fresh storage: everything on (engine used to default to off)
let s = memoryStorage();
for(const name of Object.keys(PREFS)) assert.strictEqual(getPref(name, s), true, `${name} defaults to on`);
assert.strictEqual(getPref('engine', null), true, 'no storage falls back to the default');

// saved choices win, in the existing formats
s = memoryStorage({ enduro_music_muted: 'true', enduro_engine_muted: 'false', enduro_sfx_muted: 'true', enduro_crt: 'false' });
assert.strictEqual(getPref('music', s), false);
assert.strictEqual(getPref('engine', s), true);
assert.strictEqual(getPref('sfx', s), false);
assert.strictEqual(getPref('crt', s), false);

// set/get round trip keeps the stored format
s = memoryStorage();
setPref('engine', false, s);
assert.strictEqual(s.data.enduro_engine_muted, 'true');
assert.strictEqual(getPref('engine', s), false);
setPref('crt', false, s);
assert.strictEqual(s.data.enduro_crt, 'false');
assert.strictEqual(getPref('crt', s), false);
setPref('crt', true, s);
assert.strictEqual(getPref('crt', s), true);

// invalid values fall back to the default
s = memoryStorage({ enduro_sfx_muted: 'maybe', enduro_crt: '' });
assert.strictEqual(getPref('sfx', s), true);
assert.strictEqual(getPref('crt', s), true);

console.log('test_prefs: all assertions passed');
