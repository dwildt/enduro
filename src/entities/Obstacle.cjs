class Obstacle {
  constructor(lane=0, lanePositions=[80,240,400], y=-50, speed=120){
    this.lane = lane;
    this.lanePositions = lanePositions;
    this.x = lanePositions[lane];
    this.y = y;
    this.speed = speed; // pixels per second moving down
    this.width = 32;
    this.height = 48;
    this.type = 'car';
  }

  update(dt){
    this.y += this.speed * dt;
  }

  isOffscreen(canvasHeight){
    return this.y - this.height/2 > canvasHeight;
  }
}

module.exports = Obstacle;
