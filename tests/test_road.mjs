import assert from 'assert';
import { Road, project, SEGMENT_LENGTH, PLAYER_Z_OFFSET, CAMERA_HEIGHT, ROAD_WIDTH, RUMBLE_LENGTH } from '../src/outrun/road.js';
import { buildTrack, getTheme, THEMES } from '../src/outrun/track.js';

// addRoad creates enter + hold + leave segments with eased curve
const road = new Road();
road.addCurve(10, 4);
assert.strictEqual(road.segments.length, 30);
assert.strictEqual(road.segments[0].curve, 0, 'curve eases in from 0');
assert.strictEqual(road.segments[15].curve, 4, 'hold section keeps full curve');
assert.ok(road.segments[29].curve < 4 && road.segments[29].curve > 0, 'curve eases out');

// hills: y is continuous between segments and reaches the target height
road.addHill(10, 5);
for(let i = 1; i < road.segments.length; i++){
  assert.strictEqual(road.segments[i].y1, road.segments[i - 1].y2, 'segment heights are continuous');
}
road.addDownhillToEnd(10);
assert.ok(Math.abs(road.lastY()) < 1e-6, 'downhill brings the road back to y=0');

// stripes alternate every RUMBLE_LENGTH segments
assert.strictEqual(road.segments[0].stripe, 0);
assert.strictEqual(road.segments[RUMBLE_LENGTH].stripe, 1);

// findSegment loops and accepts negative distances
assert.strictEqual(road.findSegment(0).index, 0);
assert.strictEqual(road.findSegment(SEGMENT_LENGTH * 2.5).index, 2);
assert.strictEqual(road.findSegment(road.trackLength + SEGMENT_LENGTH).index, 1);
assert.strictEqual(road.findSegment(-1).index, road.segments.length - 1);

// projection: the player's depth lands exactly at the bottom of the screen, center x
const p = project(0, 0, PLAYER_Z_OFFSET, 0, CAMERA_HEIGHT, 320, 224, 96);
assert.strictEqual(p.y, 224);
assert.strictEqual(p.x, 160);
assert.strictEqual(p.w, Math.round(ROAD_WIDTH / CAMERA_HEIGHT * 160));
// farther points are closer to the horizon and smaller
const far = project(0, 0, PLAYER_Z_OFFSET * 10, 0, CAMERA_HEIGHT, 320, 224, 96);
assert.ok(far.y < p.y && far.y > 96 && far.w < p.w);
// camera moved right -> road center moves left on screen
assert.ok(project(0, 0, PLAYER_Z_OFFSET, 500, CAMERA_HEIGHT, 320, 224, 96).x < 160);

// the full course loops seamlessly and has scenery
const track = buildTrack();
assert.ok(Math.abs(track.lastY()) < 1e-6, 'course ends at height 0');
assert.ok(track.segments.some(s => s.sprites.length > 0));
assert.ok(track.segments.some(s => s.sprites.some(sp => sp.offset < 0)) && track.segments.some(s => s.sprites.some(sp => sp.offset > 0)), 'scenery on both sides');

// one theme per phase, unknown phase falls back to phase 1
assert.deepStrictEqual(Object.keys(THEMES), ['1', '2', '3', '4']);
assert.strictEqual(getTheme(99), THEMES[1]);

console.log('test_road: all assertions passed');
