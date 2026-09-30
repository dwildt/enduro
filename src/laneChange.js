// Traffic lane changes shared by both modes: a car signals, then slides to an adjacent free lane.
// Pure logic; each mode maps its coordinates through opts.ahead(car) = distance ahead of the player.
export const SIGNAL_SECONDS = 0.6; // blinker time before the car starts moving
export const CHANGE_SECONDS = 0.8; // time to slide into the next lane

// true while the car blinks or moves (renderers draw the blinker on side `car.change.dir`)
export const isSignaling = car => !!car.change;

function laneFree(cars, car, lane, opts){
  const pos = opts.ahead(car);
  return !cars.some(other => other !== car &&
    (other.lane === lane || (other.change && other.change.to === lane)) &&
    Math.abs(opts.ahead(other) - pos) < opts.minGap);
}

/**
 * Advance lane changes for all cars.
 * opts: { random, rate (changes per car per second), laneX (array of lane x positions),
 *         minGap (clearance to other cars), minAhead / maxAhead (window ahead of the player where a
 *         change may start, maxAhead optional), ahead(car) }
 */
export function updateLaneChanges(cars, dt, opts){
  for(const car of cars){
    const c = car.change;
    if(!c){
      const ahead = opts.ahead(car);
      if(opts.rate <= 0 || ahead < opts.minAhead || ahead > (opts.maxAhead ?? Infinity) || opts.random() >= opts.rate * dt) continue;
      let dir = opts.random() < 0.5 ? -1 : 1;
      if(car.lane + dir < 0 || car.lane + dir >= opts.laneX.length) dir = -dir;
      const to = car.lane + dir;
      if(laneFree(cars, car, to, opts)) car.change = { from: car.lane, to, dir, signal: SIGNAL_SECONDS, t: 0 };
      continue;
    }
    if(c.signal > 0){
      c.signal -= dt;
      // the lane may have been taken while blinking: give up
      if(c.signal <= 0 && !laneFree(cars, car, c.to, opts)) car.change = null;
      continue;
    }
    c.t = Math.min(1, c.t + dt / CHANGE_SECONDS);
    const e = c.t * c.t * (3 - 2 * c.t); // smoothstep
    car.x = opts.laneX[c.from] + (opts.laneX[c.to] - opts.laneX[c.from]) * e;
    if(c.t >= 1){
      car.lane = c.to;
      car.x = opts.laneX[c.to];
      car.change = null;
    }
  }
}
