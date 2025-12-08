const assert = require('assert');
const { mapKey, mapPointer, detectSwipe } = require('../src/input.cjs');

// key mapping
assert.strictEqual(mapKey('ArrowLeft'),'moveLeft');
assert.strictEqual(mapKey('a'),'moveLeft');
assert.strictEqual(mapKey('ArrowRight'),'moveRight');
assert.strictEqual(mapKey('d'),'moveRight');
assert.strictEqual(mapKey(' '),'brake');
assert.strictEqual(mapKey('Enter'),'pause');
assert.strictEqual(mapKey('x'),null);

// pointer mapping (canvas width 480)
assert.strictEqual(mapPointer(10,480),'moveLeft');
assert.strictEqual(mapPointer(479,480),'moveRight');
assert.strictEqual(mapPointer(240,480),'moveRight');

// swipe detection
assert.strictEqual(detectSwipe(50,30),'moveRight');
assert.strictEqual(detectSwipe(-50,30),'moveLeft');
assert.strictEqual(detectSwipe(10,30),null);

console.log('test_input: all assertions passed');
