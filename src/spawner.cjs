const { createLCG } = require('./prng.cjs');

class Spawner {
  constructor({ lanes=3, ratePerSecond=0.5, seed=1 } = {}){
    this.lanes = lanes;
    this.rate = ratePerSecond;
    this.rng = createLCG(seed);
  }

  // simulate dt seconds and return array of spawned obstacles {lane,type}
  update(dt){
    const spawns = [];
    // simple single-event probability per step
    const prob = this.rate * dt;
    // allow multiple checks for dt > 1s
    let steps = Math.ceil(dt / 0.1);
    const subdt = dt / steps;
    for(let i=0;i<steps;i++){
      const r = this.rng.nextFloat();
      if(r < this.rate * subdt){
        const lane = Math.floor(this.rng.nextFloat() * this.lanes);
        spawns.push({ lane, type: (this.rng.nextFloat() < 0.5? 'car':'obstacle') });
      }
    }
    return spawns;
  }
}

module.exports = { Spawner };
