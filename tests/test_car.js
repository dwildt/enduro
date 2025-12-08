const assert = require('assert');
const { Car } = require('../src/car.cjs');

// initial lane
const car = new Car(1,[80,240,400]);
assert.strictEqual(car.x,240,'initial x should match lane center');

// move right
car.moveRight();
// simulate updates until reaches target
let t=0; while(car.x !== car.targetX && t<1.0){ car.update(0.016); t+=0.016 }
assert.strictEqual(car.lane,2,'lane should be 2 after moveRight');
assert.strictEqual(car.x,400,'x should reach lane target');

// move left twice
car.moveLeft(); car.moveLeft();
let steps=0; while(car.x !== car.targetX && steps<200){ car.update(0.016); steps++ }
assert.strictEqual(car.lane,0,'lane should be 0 after two moveLeft');
assert.strictEqual(car.x,80,'x should reach leftmost lane');

console.log('test_car: all assertions passed');
