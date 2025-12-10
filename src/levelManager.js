export class LevelManager {
  constructor(){
    this.phases = [
      { id:1, name:'Country Roads', duration:60, baseSpeed:1.0, spawnRate:0.6 },
      { id:2, name:'Mountain Pass', duration:90, baseSpeed:1.3, spawnRate:0.9 },
      { id:3, name:'Desert Highway', duration:120, baseSpeed:1.6, spawnRate:1.4 },
      { id:4, name:'Night City Sprint', duration:99999, baseSpeed:2.0, spawnRate:2.2 }
    ];
    this.currentIndex = 0;
    this.elapsedInPhase = 0;
  }

  getCurrentPhase(){
    return this.phases[this.currentIndex];
  }

  getDifficulty(){
    const p = this.getCurrentPhase();
    return { baseSpeed: p.baseSpeed, spawnRate: p.spawnRate };
  }

  // dt in seconds, returns true if transitioned
  update(dt){
    this.elapsedInPhase += dt;
    if(this.elapsedInPhase >= this.getCurrentPhase().duration){
      if(this.currentIndex < this.phases.length - 1){
        this.currentIndex += 1;
        this.elapsedInPhase = 0;
        return true;
      }
    }
    return false;
  }

  reset(){
    this.currentIndex = 0;
    this.elapsedInPhase = 0;
  }
}
