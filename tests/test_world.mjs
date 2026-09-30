import assert from 'assert';
import { World, SPEED_PER_BASE, BOOST_SPEED_MULTIPLIER, HIT_INVUL_SECONDS, SPAWN_AHEAD, MIN_GAP_SCALE, INVULN_DURATION, SCOREBOOST_DURATION, PICKUP_INTERVAL } from '../src/outrun/world.js';
import { buildTrack } from '../src/outrun/track.js';
import { LANE_X } from '../src/outrun/road.js';

const DT = 1 / 60;
const never = () => 0.99; // random() that never spawns traffic
const track = buildTrack();

function run(world, seconds){
  const events = [];
  for(let t = 0; t < seconds; t += DT) events.push(...world.update(DT));
  return events;
}

// speed ramps up to the phase speed and distance grows
let w = new World(track, never);
run(w, 3);
assert.strictEqual(w.speed, SPEED_PER_BASE * 1.0);
assert.ok(w.distance > 0);
assert.ok(w.kmh > 100 && w.kmh < 200);

// lane changes are clamped and interpolated smoothly
w = new World(track, never);
assert.strictEqual(w.moveLeft(), true);
assert.strictEqual(w.moveLeft(), false, 'cannot leave the road');
assert.strictEqual(w.lane, 0);
w.update(DT);
assert.ok(w.playerX < LANE_X[1] && w.playerX > LANE_X[0], 'x moves gradually');
assert.strictEqual(w.steer, -1);
run(w, 1);
assert.strictEqual(w.playerX, LANE_X[0]);

// score: 10 points/second
w = new World(track, never);
run(w, 2);
assert.ok(Math.abs(w.score - 20) < 0.5);

// collision with traffic: lose a life, get invulnerable, slow down, car removed
w = new World(track, never);
run(w, 2);
w.traffic.push({ lane: 1, x: LANE_X[1], z: w.playerZ + 50, speed: 0, variant: 0 });
let events = w.update(DT);
assert.ok(events.includes('hit'));
assert.strictEqual(w.lives, 2);
assert.strictEqual(w.traffic.length, 0);
assert.ok(w.speed < SPEED_PER_BASE * 0.5);
assert.ok(Math.abs(w.invulTimer - HIT_INVUL_SECONDS) < 1e-9);
// no hit while invulnerable
w.traffic.push({ lane: 1, x: LANE_X[1], z: w.playerZ + 10, speed: 0, variant: 0 });
assert.ok(!w.update(DT).includes('hit'));

// car in another lane does not collide
w = new World(track, never);
w.traffic.push({ lane: 0, x: LANE_X[0], z: w.playerZ + 10, speed: 0, variant: 0 });
assert.ok(!w.update(DT).includes('hit'));

// game over after the last life
w = new World(track, never);
w.lives = 1;
w.traffic.push({ lane: 1, x: LANE_X[1], z: w.playerZ, speed: 0, variant: 0 });
events = w.update(DT);
assert.ok(events.includes('gameover'));
assert.strictEqual(w.running, false);
assert.deepStrictEqual(w.update(DT), [], 'no updates after game over');

// spawning respects minGap per lane
w = new World(track, () => 0); // always spawn, always lane 0
w.spawnTraffic(DT, { spawnRate: 1, minGap: 120 });
w.spawnTraffic(DT, { spawnRate: 1, minGap: 120 });
assert.strictEqual(w.traffic.length, 1, 'second car in same lane blocked by minGap');
w.traffic[0].z -= 120 * MIN_GAP_SCALE;
w.spawnTraffic(DT, { spawnRate: 1, minGap: 120 });
assert.strictEqual(w.traffic.length, 2);
assert.strictEqual(w.traffic[1].z, w.distance + SPAWN_AHEAD);

// pickups spawn periodically and apply power-ups with countdown beeps
w = new World(track, never);
run(w, PICKUP_INTERVAL + DT);
assert.strictEqual(w.pickups.length, 1);
assert.strictEqual(w.pickups[0].type, 'scoreboost');
w.pickups[0].z = w.playerZ; w.pickups[0].x = w.playerX;
assert.ok(w.update(DT).includes('powerup'));
assert.strictEqual(w.powerUpType, 'scoreboost');
run(w, 1);
assert.strictEqual(w.speed, SPEED_PER_BASE * BOOST_SPEED_MULTIPLIER, 'boost makes the car faster');
events = run(w, SCOREBOOST_DURATION - 1 + 0.1);
assert.strictEqual(events.filter(e => e === 'beep').length, 3);
assert.strictEqual(w.powerUpType, null);
run(w, 1);
assert.strictEqual(w.speed, SPEED_PER_BASE, 'speed returns to normal after the boost');

// invulnerability power-up ignores traffic
w = new World(track, never);
w.powerUpType = 'invuln'; w.powerUpTimer = INVULN_DURATION;
w.traffic.push({ lane: 1, x: LANE_X[1], z: w.playerZ, speed: 0, variant: 0 });
assert.ok(!w.update(DT).includes('hit'));

// phase transition emits a checkpoint and raises the speed
w = new World(track, never);
events = run(w, 20.5);
assert.ok(events.includes('checkpoint'));
assert.strictEqual(w.levelManager.getCurrentPhase().id, 2);
run(w, 1);
assert.strictEqual(w.speed, SPEED_PER_BASE * 1.3);

// reset restores the initial state
w.reset();
assert.strictEqual(w.lives, 3);
assert.strictEqual(w.score, 0);
assert.strictEqual(w.levelManager.getCurrentPhase().id, 1);

console.log('test_world: all assertions passed');
