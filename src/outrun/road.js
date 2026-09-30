// Pseudo-3D road model ("Lou's Pseudo 3D" / Jake Gordon technique).
// Pure logic: no rendering, so it can be unit tested in Node.

export const SEGMENT_LENGTH = 200;   // world units per segment
export const RUMBLE_LENGTH = 3;      // segments per rumble/stripe color band
export const ROAD_WIDTH = 1200;      // half road width in world units
export const CAMERA_HEIGHT = 1000;
export const FIELD_OF_VIEW = 100;    // degrees
export const CAMERA_DEPTH = 1 / Math.tan((FIELD_OF_VIEW / 2) * Math.PI / 180);
export const DRAW_DISTANCE = 200;    // segments rendered ahead of the camera
export const PLAYER_Z_OFFSET = CAMERA_HEIGHT * CAMERA_DEPTH; // player sits at the bottom of the screen

export const LANES = 3;
// lane centers in normalized road coordinates (-1 = left edge, 1 = right edge)
export const LANE_X = [-2/3, 0, 2/3];

export function easeIn(a, b, p){ return a + (b - a) * Math.pow(p, 2); }
export function easeInOut(a, b, p){ return a + (b - a) * ((-Math.cos(p * Math.PI) / 2) + 0.5); }
export function interpolate(a, b, p){ return a + (b - a) * p; }

export class Road {
  constructor(){
    this.segments = [];
  }

  lastY(){
    return this.segments.length === 0 ? 0 : this.segments[this.segments.length - 1].y2;
  }

  addSegment(curve, y){
    const index = this.segments.length;
    this.segments.push({
      index,
      y1: this.lastY(),
      y2: y,
      curve,
      stripe: Math.floor(index / RUMBLE_LENGTH) % 2,
      sprites: []
    });
  }

  // enter/hold/leave in segments; curve strength; hill height in world units (relative)
  addRoad(enter, hold, leave, curve = 0, height = 0){
    const startY = this.lastY();
    const endY = startY + height * SEGMENT_LENGTH;
    const total = enter + hold + leave;
    for(let n = 0; n < enter; n++) this.addSegment(easeIn(0, curve, n / enter), easeInOut(startY, endY, (n + 1) / total));
    for(let n = 0; n < hold; n++) this.addSegment(curve, easeInOut(startY, endY, (enter + n + 1) / total));
    for(let n = 0; n < leave; n++) this.addSegment(easeInOut(curve, 0, n / leave), easeInOut(startY, endY, (enter + hold + n + 1) / total));
  }

  addStraight(num = 25){ this.addRoad(num, num, num, 0, 0); }
  addCurve(num = 25, curve = 4, height = 0){ this.addRoad(num, num, num, curve, height); }
  addHill(num = 25, height = 20){ this.addRoad(num, num, num, 0, height); }

  // bring the road back to y=0 so the loop is seamless
  addDownhillToEnd(num = 100){
    this.addRoad(num, num, num, 0, -this.lastY() / SEGMENT_LENGTH);
  }

  get trackLength(){ return this.segments.length * SEGMENT_LENGTH; }

  // z is an unbounded distance along the road; the track loops
  findSegment(z){
    const count = this.segments.length;
    const i = Math.floor(z / SEGMENT_LENGTH) % count;
    return this.segments[(i + count) % count];
  }

  // road height at distance z (interpolated inside the segment)
  heightAt(z){
    const seg = this.findSegment(z);
    const p = ((z % SEGMENT_LENGTH) + SEGMENT_LENGTH) % SEGMENT_LENGTH / SEGMENT_LENGTH;
    return interpolate(seg.y1, seg.y2, p);
  }
}

// Project a world point relative to the camera onto the screen.
// relZ is the distance in front of the camera; horizonY is where a flat road vanishes.
export function project(worldX, worldY, relZ, cameraX, cameraY, width, height, horizonY){
  const scale = CAMERA_DEPTH / relZ;
  return {
    scale,
    x: Math.round(width / 2 + scale * (worldX - cameraX) * width / 2),
    y: Math.round(horizonY - scale * (worldY - cameraY) * (height - horizonY)),
    w: Math.round(scale * ROAD_WIDTH * width / 2)
  };
}
