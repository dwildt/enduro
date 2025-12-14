export default class Pickup {
  constructor(type, lane, lanePositions, y=-50){
    this.type = type; // 'invuln' or 'scoreboost'
    this.lane = lane;
    this.lanePositions = lanePositions;
    this.x = lanePositions[lane];
    this.y = y;
    this.speed = 60; // slower than obstacles
    this.width = 24;
    this.height = 24;
  }

  update(dt){
    this.y += this.speed * dt;
  }

  isOffscreen(canvasHeight){
    return this.y - this.height/2 > canvasHeight;
  }
}
