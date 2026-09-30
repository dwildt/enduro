// OutRun mode game state: player, traffic, pickups, lives, score and phases.
// Pure logic (no rendering/audio); update() returns a list of events for the UI to react to.
import { LevelManager } from '../levelManager.js';
import { SEGMENT_LENGTH, DRAW_DISTANCE, PLAYER_Z_OFFSET, LANE_X } from './road.js';

export const SPEED_PER_BASE = 6000;      // world units/s at baseSpeed 1.0
export const ACCELERATION = 4000;        // world units/s^2 towards the phase speed
export const LANE_CHANGE_SPEED = 2.4;    // normalized road units per second
export const HIT_X = 0.3;                // normalized x overlap for collisions
export const HIT_Z = 300;                // world z overlap for collisions
export const SPAWN_AHEAD = DRAW_DISTANCE * SEGMENT_LENGTH * 0.7;
export const MIN_GAP_SCALE = 20;         // converts LevelManager minGap (px) into world units
export const MAX_KMH = 290;

export const START_LIVES = 3;
export const HIT_INVUL_SECONDS = 1.5;
export const POINTS_PER_SEC = 10;
export const PICKUP_INTERVAL = 10;
export const INVULN_DURATION = 5;
export const SCOREBOOST_DURATION = 8;
export const SCORE_MULTIPLIER = 2;
export const SKID_CURVE = 5;             // curve strength that makes the tyres squeal

export class World {
  constructor(road, random = Math.random){
    this.road = road;
    this.random = random;
    this.levelManager = new LevelManager();
    this.reset();
  }

  reset(){
    this.levelManager.reset();
    this.distance = 0;          // camera distance along the road (unbounded)
    this.speed = 0;
    this.lane = 1;
    this.playerX = LANE_X[1];
    this.traffic = [];
    this.pickups = [];
    this.lives = START_LIVES;
    this.invulTimer = 0;
    this.powerUpType = null;
    this.powerUpTimer = 0;
    this.pickupTimer = 0;
    this.skidCooldown = 0;
    this.score = 0;
    this.running = true;
  }

  get playerZ(){ return this.distance + PLAYER_Z_OFFSET; }
  get maxSpeed(){ return this.levelManager.getDifficulty().baseSpeed * SPEED_PER_BASE; }
  get kmh(){ return Math.round(this.speed / (2 * SPEED_PER_BASE) * MAX_KMH); }
  get isInvulnerable(){ return this.invulTimer > 0 || this.powerUpType === 'invuln'; }

  // -1 steering left, 1 right, 0 straight (used for the car sprite frame)
  get steer(){
    const dx = LANE_X[this.lane] - this.playerX;
    if(Math.abs(dx) > 0.01) return Math.sign(dx);
    const curve = this.road.findSegment(this.playerZ).curve;
    return Math.abs(curve) > 2 ? Math.sign(curve) : 0;
  }

  moveLeft(){ return this.setLane(this.lane - 1); }
  moveRight(){ return this.setLane(this.lane + 1); }
  setLane(lane){
    if(!this.running || lane < 0 || lane >= LANE_X.length || lane === this.lane) return false;
    this.lane = lane;
    return true;
  }

  // dt in seconds; returns events: 'checkpoint', 'hit', 'gameover', 'powerup', 'beep', 'skid'
  update(dt){
    const events = [];
    if(!this.running) return events;

    // speed eases towards the current phase speed (also recovers after a crash)
    const target = this.maxSpeed;
    this.speed = this.speed < target
      ? Math.min(target, this.speed + ACCELERATION * dt)
      : Math.max(target, this.speed - ACCELERATION * dt);
    this.distance += this.speed * dt;

    // lane interpolation
    const targetX = LANE_X[this.lane];
    const dx = targetX - this.playerX;
    const step = LANE_CHANGE_SPEED * dt;
    this.playerX = Math.abs(dx) <= step ? targetX : this.playerX + Math.sign(dx) * step;

    // score
    const multiplier = this.powerUpType === 'scoreboost' ? SCORE_MULTIPLIER : 1;
    this.score += POINTS_PER_SEC * dt * multiplier;

    if(this.levelManager.update(dt)) events.push('checkpoint');
    const diff = this.levelManager.getDifficulty();

    // tyre squeal on strong curves at speed
    this.skidCooldown = Math.max(0, this.skidCooldown - dt);
    const curve = this.road.findSegment(this.playerZ).curve;
    if(Math.abs(curve) >= SKID_CURVE && this.speed > 0.8 * target && this.skidCooldown === 0){
      this.skidCooldown = 0.8;
      events.push('skid');
    }

    this.spawnTraffic(dt, diff);
    for(const car of this.traffic) car.z += car.speed * dt;
    this.traffic = this.traffic.filter(car => car.z > this.playerZ - HIT_Z * 2);

    this.pickupTimer += dt;
    if(this.pickupTimer >= PICKUP_INTERVAL){
      this.pickupTimer = 0;
      const lane = Math.floor(this.random() * LANE_X.length);
      const type = this.random() < 0.5 ? 'invuln' : 'scoreboost';
      this.pickups.push({ type, lane, x: LANE_X[lane], z: this.distance + SPAWN_AHEAD });
    }
    this.pickups = this.pickups.filter(p => p.z > this.playerZ - HIT_Z * 2);

    this.updateTimers(dt, events);
    this.checkCollisions(events);
    return events;
  }

  spawnTraffic(dt, diff){
    if(this.random() >= diff.spawnRate * dt) return;
    const lane = Math.floor(this.random() * LANE_X.length);
    const z = this.distance + SPAWN_AHEAD;
    const minGap = diff.minGap * MIN_GAP_SCALE;
    const tooClose = this.traffic.some(car => car.lane === lane && Math.abs(car.z - z) < minGap);
    if(tooClose) return;
    // traffic drives forward slower than the player, so the player catches up
    const speed = this.maxSpeed * (0.35 + this.random() * 0.25);
    this.traffic.push({ lane, x: LANE_X[lane], z, speed, variant: Math.floor(this.random() * 4) });
  }

  updateTimers(dt, events){
    this.invulTimer = Math.max(0, this.invulTimer - dt);
    if(this.powerUpTimer > 0){
      const before = this.powerUpTimer;
      this.powerUpTimer = Math.max(0, this.powerUpTimer - dt);
      if([3, 2, 1].some(t => before > t && this.powerUpTimer <= t)) events.push('beep');
    }
    if(this.powerUpTimer <= 0) this.powerUpType = null;
  }

  overlaps(obj){
    return Math.abs(obj.x - this.playerX) < HIT_X && Math.abs(obj.z - this.playerZ) < HIT_Z;
  }

  checkCollisions(events){
    if(!this.isInvulnerable){
      const hitIndex = this.traffic.findIndex(car => this.overlaps(car));
      if(hitIndex >= 0){
        this.traffic.splice(hitIndex, 1); // the other car spins away
        this.lives = Math.max(0, this.lives - 1);
        this.invulTimer = HIT_INVUL_SECONDS;
        this.speed *= 0.3;
        events.push('hit');
        if(this.lives === 0){
          this.running = false;
          events.push('gameover');
        }
      }
    }

    const pickupIndex = this.pickups.findIndex(p => this.overlaps(p));
    if(pickupIndex >= 0){
      const p = this.pickups[pickupIndex];
      this.pickups.splice(pickupIndex, 1);
      this.powerUpType = p.type;
      this.powerUpTimer = p.type === 'invuln' ? INVULN_DURATION : SCOREBOOST_DURATION;
      events.push('powerup');
    }
  }
}
