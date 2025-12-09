const Obstacle = require('./entities/Obstacle.js').default || require('./entities/Obstacle.js');
const { Spawner } = require('./spawner.cjs');

class ObstacleManager {
  constructor({lanePositions=[80,240,400], seed=2} = {}){
    this.lanePositions = lanePositions;
    this.spawner = new Spawner({ lanes: lanePositions.length, ratePerSecond: 0.8, seed });
    this.obstacles = [];
  }

  update(dt){
    // spawn
    const spawns = this.spawner.update(dt);
    spawns.forEach(s => {
      const o = new Obstacle(s.lane, this.lanePositions, -60, 100 + Math.random()*60);
      this.obstacles.push(o);
    });
    // update positions
    this.obstacles.forEach(o => o.update(dt));
    // remove offscreen
    this.obstacles = this.obstacles.filter(o => !o.isOffscreen(640));
  }
}

module.exports = { ObstacleManager };
