import assert from 'assert';
import { updateLaneChanges, isSignaling, SIGNAL_SECONDS, CHANGE_SECONDS } from '../src/laneChange.js';

const DT = 1 / 60;
const LANE_X = [-1, 0, 1];
const seq = values => { let i = 0; return () => values[Math.min(i++, values.length - 1)]; };
const car = (lane, pos) => ({ lane, x: LANE_X[lane], pos, change: null });
const opts = (random, extra = {}) => ({ random, rate: 1, laneX: LANE_X, minGap: 100, minAhead: 300, ahead: c => c.pos, ...extra });

function run(cars, seconds, o){
  for(let t = 0; t < seconds; t += DT) updateLaneChanges(cars, DT, o);
}

// rate 0 (phase 1) never changes lanes
let c = car(1, 1000);
run([c], 5, opts(() => 0, { rate: 0 }));
assert.strictEqual(c.change, null);
assert.strictEqual(c.lane, 1);

// no new change when the car is already close to the player
c = car(1, 200);
updateLaneChanges([c], DT, opts(() => 0));
assert.strictEqual(c.change, null);

// nor when it is beyond maxAhead
c = car(1, 5000);
updateLaneChanges([c], DT, opts(() => 0, { maxAhead: 2000 }));
assert.strictEqual(c.change, null);

// a change signals first, then slides smoothly to the adjacent lane
c = car(1, 1000);
updateLaneChanges([c], DT, opts(seq([0, 0.9])));
assert.ok(isSignaling(c));
assert.deepStrictEqual([c.change.from, c.change.to, c.change.dir], [1, 2, 1]);
const noMore = opts(() => 0.99);
run([c], SIGNAL_SECONDS - 2 * DT, noMore);
assert.strictEqual(c.x, 0, 'no movement while blinking');
run([c], 4 * DT + CHANGE_SECONDS / 2, noMore);
assert.ok(c.x > 0 && c.x < 1, 'x interpolates between lanes');
assert.strictEqual(c.lane, 1, 'lane updates only when the move ends');
run([c], CHANGE_SECONDS, noMore);
assert.strictEqual(c.lane, 2);
assert.strictEqual(c.x, 1);
assert.strictEqual(c.change, null);

// edge lanes turn towards the road
c = car(0, 1000);
updateLaneChanges([c], DT, opts(seq([0, 0.1])));
assert.strictEqual(c.change.to, 1);
c = car(2, 1000);
updateLaneChanges([c], DT, opts(seq([0, 0.9])));
assert.strictEqual(c.change.to, 1);

// a target lane occupied within minGap is not used
c = car(1, 1000);
let blocker = car(2, 1050);
updateLaneChanges([c, blocker], DT, opts(seq([0, 0.9, 0.99])));
assert.strictEqual(c.change, null);
// a car already moving into the target lane also blocks it
c = car(1, 1000);
blocker = car(0, 1060);
blocker.change = { from: 0, to: 2, dir: 1, signal: 1, t: 0 };
updateLaneChanges([c, blocker], DT, opts(seq([0, 0.9, 0.99])));
assert.strictEqual(c.change, null);
// far enough away the lane is free
c = car(1, 1000);
blocker = car(2, 1200);
updateLaneChanges([c, blocker], DT, opts(seq([0, 0.9, 0.99])));
assert.strictEqual(c.change.to, 2);

// the change is cancelled if the lane gets taken while blinking
c = car(1, 1000);
updateLaneChanges([c], DT, opts(seq([0, 0.9])));
const late = car(2, 1020);
run([c, late], SIGNAL_SECONDS + DT, noMore);
assert.strictEqual(c.change, null);
assert.strictEqual(c.lane, 1);
assert.strictEqual(c.x, 0);

// deterministic with the same seeded sequence
function lcg(seed){ return () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296; }
const simulate = () => {
  const cars = [car(0, 900), car(1, 1400), car(2, 2000)];
  run(cars, 10, opts(lcg(42), { rate: 0.3 }));
  return cars.map(k => [k.lane, k.x]);
};
assert.deepStrictEqual(simulate(), simulate());

console.log('test_laneChange: all assertions passed');
