export default class Obstacle {
  constructor(lane=0, lanePositions=[80,240,400], y=-50, speed=120, animation=null){
    this.lane = lane;
    this.lanePositions = lanePositions;
    this.x = lanePositions[lane];
    this.y = y;
    this.speed = speed; // pixels per second moving down
    this.width = 32;
    this.height = 48;
    this.type = 'car';
    this.animation = animation;
  }

  update(dt){
    this.y += this.speed * dt;

    // Update animation if present
    if(this.animation){
      this.animation.update(dt);
    }
  }

  isOffscreen(canvasHeight){
    return this.y - this.height/2 > canvasHeight;
  }
}
