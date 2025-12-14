const assert = require('assert');
const Pickup = require('../src/entities/Pickup.cjs');

// Test creation
const p = new Pickup('invuln', 1, [80, 240, 400], -50);
assert.strictEqual(p.type, 'invuln');
assert.strictEqual(p.lane, 1);
assert.strictEqual(p.x, 240);
assert.strictEqual(p.y, -50);
assert.strictEqual(p.width, 24);
assert.strictEqual(p.height, 24);

// Test update
p.update(1); // 1 second at 60px/s
assert.strictEqual(p.y, 10); // -50 + 60

// Test offscreen
assert.strictEqual(p.isOffscreen(640), false);
p.y = 700;
assert.strictEqual(p.isOffscreen(640), true);

console.log('test_pickup: all assertions passed');
