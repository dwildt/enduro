const assert = require('assert');
const { LevelManager } = require('../src/levelManager.cjs');

const lm = new LevelManager();
// initial
assert.strictEqual(lm.getCurrentPhase().id, 1);
assert.deepStrictEqual(lm.getDifficulty(), { baseSpeed:1.0, spawnRate:0.4, minGap:120 });

// simulate 19 seconds -> still phase 1
lm.update(19);
assert.strictEqual(lm.getCurrentPhase().id, 1);

// simulate 1+ seconds -> transition to phase 2
const transitioned = lm.update(1.1);
assert.strictEqual(transitioned, true);
assert.strictEqual(lm.getCurrentPhase().id, 2);
assert.deepStrictEqual(lm.getDifficulty(), { baseSpeed:1.3, spawnRate:0.6, minGap:100 });

// advance to phase 3
lm.update(40); // phase2 duration is 40, update with 40s -> should transition
assert.strictEqual(lm.getCurrentPhase().id, 3);
assert.deepStrictEqual(lm.getDifficulty(), { baseSpeed:1.6, spawnRate:0.8, minGap:80 });

// advance to phase 4
lm.update(80); // phase3 duration is 80
assert.strictEqual(lm.getCurrentPhase().id, 4);
assert.deepStrictEqual(lm.getDifficulty(), { baseSpeed:2.0, spawnRate:1.0, minGap:60 });

// Test: spawn parameters increase progressively
lm.reset();
const phase1 = lm.getDifficulty();
lm.update(20); // transition to phase 2
const phase2 = lm.getDifficulty();
lm.update(40); // transition to phase 3
const phase3 = lm.getDifficulty();
lm.update(80); // transition to phase 4
const phase4 = lm.getDifficulty();

// Validate spawn rate increases
assert(phase2.spawnRate > phase1.spawnRate, 'Phase 2 spawn rate should be higher than phase 1');
assert(phase3.spawnRate > phase2.spawnRate, 'Phase 3 spawn rate should be higher than phase 2');
assert(phase4.spawnRate > phase3.spawnRate, 'Phase 4 spawn rate should be higher than phase 3');

// Validate base speed increases
assert(phase2.baseSpeed > phase1.baseSpeed, 'Phase 2 base speed should be higher than phase 1');
assert(phase3.baseSpeed > phase2.baseSpeed, 'Phase 3 base speed should be higher than phase 2');
assert(phase4.baseSpeed > phase3.baseSpeed, 'Phase 4 base speed should be higher than phase 3');

// Validate minGap decreases (more challenging)
assert(phase2.minGap < phase1.minGap, 'Phase 2 minGap should be smaller than phase 1');
assert(phase3.minGap < phase2.minGap, 'Phase 3 minGap should be smaller than phase 2');
assert(phase4.minGap < phase3.minGap, 'Phase 4 minGap should be smaller than phase 3');

// reset and check
lm.reset();
assert.strictEqual(lm.getCurrentPhase().id, 1);

console.log('test_levelManager: all assertions passed');
