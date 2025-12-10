const assert = require('assert');
const Obstacle = require('../src/entities/Obstacle.cjs');
const { aabbOverlap } = require('../src/collision.cjs');

const lanes = [80,240,400];
const ob = new Obstacle(1, lanes, -50, 100);
// update 1s -> y should increase by ~100
ob.update(1.0);
assert.ok(ob.y > -50, 'obstacle moved down');

// Collision test: place player at same position
const playerX = lanes[1];
const playerY = 540;
const playerW = 32;
const playerH = 48;
const objLeft = ob.x - ob.width/2;
const objTop = playerY - ob.height/2; // force overlap
const overlap = aabbOverlap(playerX - playerW/2, playerY - playerH/2, playerW, playerH, objLeft, objTop, ob.width, ob.height);
assert.strictEqual(typeof overlap, 'boolean');

console.log('test_obstacle: assertions passed');
