// Pixi renderer for the pseudo-3D road, scenery, traffic and player car.
import { Container, Graphics, Sprite, TilingSprite } from 'pixi.js';
import {
  project, SEGMENT_LENGTH, ROAD_WIDTH, CAMERA_HEIGHT, DRAW_DISTANCE
} from './road.js';
import { getTheme } from './track.js';
import { makeBackdrop, makeScenery, makeTraffic, makePickups, makePlayerCar, WORLD_WIDTH } from './sprites.js';

export const WIDTH = 320;
export const HEIGHT = 224;
export const HORIZON = 92;

function lerpColor(a, b, t){
  const ch = (shift) => {
    const ca = (a >> shift) & 255, cb = (b >> shift) & 255;
    return Math.round(ca + (cb - ca) * t) << shift;
  };
  return ch(16) | ch(8) | ch(0);
}

export class OutRunRenderer {
  constructor(stage, road){
    this.road = road;
    this.root = new Container();
    stage.addChild(this.root);

    // one backdrop per theme, cross-faded on phase changes
    this.backdrops = {};
    this.backdropLayer = new Container();
    for(const id of [1, 2, 3, 4]){
      const tex = makeBackdrop(getTheme(id), WIDTH, HORIZON);
      const c = new Container();
      c.addChild(new Sprite(tex.sky));
      const far = new TilingSprite({ texture: tex.far, width: WIDTH, height: tex.far.height });
      far.y = HORIZON - tex.far.height;
      const near = new TilingSprite({ texture: tex.near, width: WIDTH, height: tex.near.height });
      near.y = HORIZON - tex.near.height;
      c.addChild(far, near);
      c.visible = false;
      this.backdrops[id] = { container: c, far, near };
      this.backdropLayer.addChild(c);
    }

    this.roadGfx = new Graphics();
    this.spriteLayer = new Container();
    this.pool = [];
    this.player = new Sprite();
    this.player.anchor.set(0.5, 1);
    this.root.addChild(this.backdropLayer, this.roadGfx, this.spriteLayer, this.player);

    this.scenery = makeScenery();
    this.trafficTex = makeTraffic();
    this.pickupTex = makePickups();
    this.carFrames = makePlayerCar('blue');
    this.bgOffset = 0;
    this.time = 0;
  }

  setCarColor(color){ this.carFrames = makePlayerCar(color); }

  // pooled sprites, assigned back-to-front each frame
  sprite(i){
    if(!this.pool[i]){
      const s = new Sprite();
      s.anchor.set(0.5, 1);
      this.pool[i] = s;
      this.spriteLayer.addChild(s);
    }
    return this.pool[i];
  }

  // theme blending: `from` fades into `to` while t goes 0 -> 1
  palette(from, to, t){
    const a = getTheme(from), b = getTheme(to);
    const mix = key => [lerpColor(a[key][0], b[key][0], t), lerpColor(a[key][1], b[key][1], t)];
    return {
      grass: mix('grass'), rumble: mix('rumble'), road: mix('road'),
      lane: lerpColor(a.lane, b.lane, t),
      fog: lerpColor(a.sky[a.sky.length - 1], b.sky[b.sky.length - 1], t),
      scenery: t < 0.5 ? a.scenery : b.scenery
    };
  }

  render(world, dt, transition){
    this.time += dt;
    const { from, to, t } = transition;
    const colors = this.palette(from, to, t);
    const road = this.road;
    const segments = road.segments;
    const count = segments.length;

    // backdrops: cross-fade and parallax driven by the curve under the player
    const playerSeg = road.findSegment(world.playerZ);
    this.bgOffset += playerSeg.curve * (world.speed / 12000) * dt * 60;
    for(const [id, b] of Object.entries(this.backdrops)){
      const n = Number(id);
      b.container.visible = n === from || n === to;
      b.container.alpha = 1;
      b.far.tilePosition.x = -this.bgOffset * 0.3;
      b.near.tilePosition.x = -this.bgOffset * 0.8;
    }
    const top = this.backdrops[to].container; // new theme fades in over the old one
    this.backdropLayer.setChildIndex(top, this.backdropLayer.children.length - 1);
    top.alpha = from === to ? 1 : t;

    // road, projected front-to-back with hill clipping (maxY)
    const g = this.roadGfx;
    g.clear();
    g.rect(0, HORIZON, WIDTH, HEIGHT - HORIZON).fill(colors.grass[0]);

    const baseIndex = Math.floor(world.distance / SEGMENT_LENGTH);
    const basePercent = (world.distance % SEGMENT_LENGTH) / SEGMENT_LENGTH;
    const cameraY = CAMERA_HEIGHT + road.heightAt(world.playerZ);
    const cameraX = world.playerX * ROAD_WIDTH;
    let x = 0;
    let dx = -(segments[baseIndex % count].curve * basePercent);
    let maxY = HEIGHT;
    const projected = [];

    for(let n = 0; n < DRAW_DISTANCE; n++){
      const i = baseIndex + n;
      const seg = segments[i % count];
      const z1 = i * SEGMENT_LENGTH - world.distance;
      const p1 = project(0, seg.y1, z1, cameraX - x, cameraY, WIDTH, HEIGHT, HORIZON);
      const p2 = project(0, seg.y2, z1 + SEGMENT_LENGTH, cameraX - x - dx, cameraY, WIDTH, HEIGHT, HORIZON);
      x += dx;
      dx += seg.curve;
      const entry = { n, seg, p1, p2, clip: maxY };
      projected.push(entry);
      if(z1 <= 1 || p2.y >= p1.y || p2.y >= maxY) continue;
      const fog = Math.min(0.85, Math.pow(n / DRAW_DISTANCE, 2) * 1.6);
      this.drawSegment(g, p1, p2, maxY, seg.stripe, colors, fog);
      maxY = p2.y;
    }

    // sprites back-to-front
    let used = 0;
    const place = (tex, sx, sy, worldW, scale, clip, anchorX = 0.5) => {
      const screenW = worldW * scale * WIDTH / 2;
      if(screenW < 1 || sy - screenW * tex.height / tex.width > HEIGHT) return;
      const s = this.sprite(used++);
      s.texture = tex;
      s.anchor.set(anchorX, 1);
      s.scale.set(screenW / tex.width);
      s.position.set(Math.round(sx), Math.round(sy));
      // crude hill clipping: hide sprites mostly hidden behind a crest
      s.visible = sy - clip < s.height * 0.5;
    };

    const bySegment = new Map();
    const addObj = (obj, tex, worldW) => {
      const n = Math.floor(obj.z / SEGMENT_LENGTH) - baseIndex;
      if(n < 1 || n >= DRAW_DISTANCE) return;
      if(!bySegment.has(n)) bySegment.set(n, []);
      bySegment.get(n).push({ obj, tex, worldW });
    };
    world.traffic.forEach(car => addObj(car, this.trafficTex[car.variant], car.variant === 3 ? WORLD_WIDTH.truck : WORLD_WIDTH.car));
    world.pickups.forEach(p => addObj(p, this.pickupTex[p.type], WORLD_WIDTH.pickup));

    for(let n = DRAW_DISTANCE - 1; n > 0; n--){
      const { seg, p1, p2, clip } = projected[n];
      if(p1.scale <= 0) continue;
      for(const sp of seg.sprites){
        const kind = colors.scenery[sp.kind];
        // anchor on the road-side edge so scenery always grows away from the road
        place(this.scenery[kind], p1.x + sp.offset * p1.w, p1.y, WORLD_WIDTH[kind], p1.scale, clip, sp.offset < 0 ? 1 : 0);
      }
      const objs = bySegment.get(n);
      if(objs){
        objs.sort((a, b) => b.obj.z - a.obj.z);
        for(const { obj, tex, worldW } of objs){
          const f = (obj.z % SEGMENT_LENGTH) / SEGMENT_LENGTH;
          const sx = p1.x + (p2.x - p1.x) * f + obj.x * (p1.w + (p2.w - p1.w) * f);
          const sy = p1.y + (p2.y - p1.y) * f;
          place(tex, sx, sy, worldW, p1.scale + (p2.scale - p1.scale) * f, clip);
        }
      }
    }
    for(let i = used; i < this.pool.length; i++) this.pool[i].visible = false;

    // player car: bounce at speed, blink while recovering from a hit, tint with shield
    const p = this.player;
    p.texture = this.carFrames[String(world.steer)];
    const bounce = world.speed > 100 && Math.floor(this.time * 20) % 2 === 0 ? 1 : 0;
    p.position.set(WIDTH / 2, HEIGHT - 4 - bounce);
    p.visible = world.invulTimer <= 0 || Math.floor(this.time * 16) % 2 === 0;
    p.tint = world.powerUpType === 'invuln' && Math.floor(this.time * 8) % 2 === 0 ? 0x80c0ff : 0xffffff;
  }

  drawSegment(g, p1, p2, maxY, stripe, colors, fog){
    // clip the near edge to maxY so far segments never paint over nearer road (hill crests)
    let y1 = p1.y, x1 = p1.x, w1 = p1.w;
    if(y1 > maxY){
      const t = (y1 - maxY) / (y1 - p2.y);
      x1 += (p2.x - x1) * t;
      w1 += (p2.w - w1) * t;
      y1 = maxY;
    }
    const { y: y2, x: x2, w: w2 } = p2;
    const c = col => lerpColor(col, colors.fog, fog);
    const quad = (xa, wa, xb, wb, color) => g.poly([xa - wa, y1, xa + wa, y1, xb + wb, y2, xb - wb, y2]).fill(c(color));

    g.rect(0, y2, WIDTH, y1 - y2).fill(c(colors.grass[stripe]));
    const r1 = w1 / 5, r2 = w2 / 5;
    quad(x1, w1 + r1, x2, w2 + r2, colors.rumble[stripe]);
    quad(x1, w1, x2, w2, colors.road[stripe]);
    if(stripe === 0){
      const l1 = Math.max(1, w1 / 40), l2 = Math.max(1, w2 / 40);
      for(const k of [-1/3, 1/3]) quad(x1 + w1 * k, l1, x2 + w2 * k, l2, colors.lane);
    }
  }
}
