class Car {
  constructor(laneIndex=1, lanePositions=[80,240,400]){
    this.lanePositions = lanePositions;
    this.lane = laneIndex;
    this.x = lanePositions[laneIndex];
    this.y = 540;
    this.targetX = this.x;
    this.speed = 300;
  }
  moveLeft(){ this.setLane(Math.max(0,this.lane-1)) }
  moveRight(){ this.setLane(Math.min(this.lanePositions.length-1,this.lane+1)) }
  setLane(i){ this.lane = i; this.targetX = this.lanePositions[i] }
  update(dt){ const dx = this.targetX - this.x; if(Math.abs(dx)<1){ this.x = this.targetX; return } const dir=Math.sign(dx); const move = this.speed*dt*dir; if(Math.abs(move)>=Math.abs(dx)) this.x=this.targetX; else this.x+=move }
}
module.exports = { Car }
