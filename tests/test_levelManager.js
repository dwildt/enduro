const assert = require('assert');
const { LevelManager } = require('../src/levelManager.cjs');

const lm = new LevelManager();
// initial
assert.strictEqual(lm.getCurrentPhase().id, 1);
assert.deepStrictEqual(lm.getDifficulty(), { baseSpeed:1.0, spawnRate:0.5 });

// simulate 59 seconds -> still phase 1
lm.update(59);
assert.strictEqual(lm.getCurrentPhase().id, 1);

// simulate 1+ seconds -> transition to phase 2
const transitioned = lm.update(1.1);
assert.strictEqual(transitioned, true);
assert.strictEqual(lm.getCurrentPhase().id, 2);
assert.deepStrictEqual(lm.getDifficulty(), { baseSpeed:1.3, spawnRate:0.8 });

// advance to phase 3
lm.update(90); // phase2 duration is 90, update with 90s -> should transition
assert.strictEqual(lm.getCurrentPhase().id, 3);

// reset and check
lm.reset();
assert.strictEqual(lm.getCurrentPhase().id, 1);

console.log('test_levelManager: all assertions passed');
