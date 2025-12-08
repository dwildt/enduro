const assert = require('assert');
const { simulateStep } = require('../src/gameLoop.cjs');

// Test 1: exact single tick
let res = simulateStep(0, 16, 0, 16);
assert.strictEqual(res.updates, 1, 'Should perform 1 update for 16ms with TICK 16');
assert.strictEqual(res.accumulator, 0, 'Accumulator should be 0 after exact tick');

// Test 2: multiple ticks in one frame
res = simulateStep(0, 50, 0, 16); // frameTime 50 -> 3 ticks (16*3=48), remainder 2
assert.strictEqual(res.updates, 3, 'Should perform 3 updates for 50ms with TICK 16');
assert.strictEqual(res.accumulator, 2, 'Accumulator should be 2ms remainder');

// Test 3: accumulator carryover
res = simulateStep(0, 10, 10, 16); // accumulator 10 + frame 10 = 20 -> 1 update, remainder 4
assert.strictEqual(res.updates, 1, 'Should perform 1 update with carryover');
assert.strictEqual(res.accumulator, 4, 'Accumulator should be 4ms remainder');

console.log('test_game_loop: all assertions passed');
