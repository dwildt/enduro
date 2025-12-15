const assert = require('assert');
const { SpriteAnimation } = require('../src/spriteAnimation.cjs');

// Test 1: Constructor initialization
const anim = new SpriteAnimation({
  imagePath: 'test.png',
  frameWidth: 32,
  frameHeight: 48,
  frameCount: 4,
  fps: 10
});

assert.strictEqual(anim.currentFrame, 0, 'starts at frame 0');
assert.strictEqual(anim.frameCount, 4, 'frameCount is 4');
assert.strictEqual(anim.frameDuration, 0.1, 'fps 10 = 0.1s per frame');

// Mark as loaded for testing
anim.loaded = true;

// Test 2: Frame advancement
anim.update(0.05); // Half frame duration
assert.strictEqual(anim.currentFrame, 0, 'frame unchanged after 0.05s');
anim.update(0.05); // Complete one frame duration (0.1s total)
assert.strictEqual(anim.currentFrame, 1, 'advanced to frame 1 after 0.1s');

// Test 3: Looping
anim.currentFrame = 3; // Last frame
anim.accumulator = 0;
anim.update(0.1); // One frame duration
assert.strictEqual(anim.currentFrame, 0, 'looped back to frame 0');

// Test 4: Non-looping
const noLoop = new SpriteAnimation({
  imagePath: 'test.png',
  frameWidth: 32,
  frameHeight: 48,
  frameCount: 4,
  fps: 10,
  loop: false
});
noLoop.loaded = true;
noLoop.currentFrame = 3;
noLoop.accumulator = 0;
noLoop.update(0.1);
assert.strictEqual(noLoop.currentFrame, 3, 'stays at last frame when loop=false');

// Test 5: getCurrentFrame coordinates
anim.currentFrame = 0;
let frame = anim.getCurrentFrame();
assert.strictEqual(frame.x, 0, 'frame 0 x = 0');
assert.strictEqual(frame.width, 32, 'frame width = 32');
assert.strictEqual(frame.height, 48, 'frame height = 48');

anim.currentFrame = 2;
frame = anim.getCurrentFrame();
assert.strictEqual(frame.x, 64, 'frame 2 x = 64 (frameWidth * 2)');

// Test 6: Reset functionality
anim.currentFrame = 2;
anim.accumulator = 0.05;
anim.reset();
assert.strictEqual(anim.currentFrame, 0, 'reset() sets currentFrame to 0');
assert.strictEqual(anim.accumulator, 0, 'reset() sets accumulator to 0');

console.log('test_spriteAnimation: all assertions passed');
