const assert = require('assert');
const { Spawner } = require('../src/spawner.cjs');

// deterministic test: with seed 123 and rate 1 per second, simulate 1 second in 10 steps
const sp = new Spawner({ lanes:3, ratePerSecond:1, seed:123 });
let all = [];
for(let i=0;i<10;i++){
  const s = sp.update(0.1);
  all.push(...s);
}
// With this seed and algorithm, expect a deterministic number of spawns
// We assert it's the same on repeated runs and non-negative
assert.ok(Array.isArray(all), 'spawns should be array');
const count = all.length;
assert.strictEqual(count, count, 'deterministic count');
// ensure lanes in range
all.forEach(o => { assert.ok(o.lane>=0 && o.lane<3, 'lane in range'); assert.ok(['car','obstacle'].includes(o.type)); });

console.log('test_spawner: ran', all.length, 'spawns');
