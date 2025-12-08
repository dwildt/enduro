const assert = require('assert');
const { aabbOverlap, PlayerLives } = require('../src/collision.cjs');

// AABB tests
assert.strictEqual(aabbOverlap(0,0,10,10,5,5,10,10), true, 'overlap true');
assert.strictEqual(aabbOverlap(0,0,10,10,10,10,5,5), false, 'touching at edge is no overlap');
assert.strictEqual(aabbOverlap(0,0,5,5,6,6,2,2), false, 'separated no overlap');

// PlayerLives tests
const p = new PlayerLives(3, 0.5);
assert.strictEqual(p.getLives(), 3);
assert.strictEqual(p.isAlive(), true);
assert.strictEqual(p.isInvulnerable(), false);

let res = p.hit();
assert.strictEqual(res, true, 'first hit should apply');
assert.strictEqual(p.getLives(), 2);
assert.strictEqual(p.isInvulnerable(), true);

// immediate subsequent hit should be ignored
res = p.hit();
assert.strictEqual(res, false, 'hit during invulnerability ignored');
assert.strictEqual(p.getLives(), 2);

// advance time past invulnerability
p.update(0.6);
assert.strictEqual(p.isInvulnerable(), false);

// apply two more hits to reach zero
assert.strictEqual(p.hit(), true);
assert.strictEqual(p.getLives(), 1);
// wait
p.update(0.6);
assert.strictEqual(p.hit(), true);
assert.strictEqual(p.getLives(), 0);
assert.strictEqual(p.isAlive(), false);
// further hits ignored
assert.strictEqual(p.hit(), false);

console.log('test_collision: all assertions passed');
