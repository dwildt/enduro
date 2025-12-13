class LevelManager {
  constructor(){
    // phases definitions: id, name, duration (seconds), baseSpeed, spawnRate
    this.phases = [
      { id:1, name:'Country Roads', duration:20, baseSpeed:1.0, spawnRate:0.4 },
      { id:2, name:'Mountain Pass', duration:40, baseSpeed:1.3, spawnRate:0.6 },
      { id:3, name:'Desert Highway', duration:80, baseSpeed:1.6, spawnRate:0.8 },
      { id:4, name:'Night City Sprint', duration:99999, baseSpeed:2.0, spawnRate:1.0 }
    ];
    this.currentIndex = 0; // index into phases
    this.elapsedInPhase = 0; // seconds
    this.totalElapsed = 0;
  }

  getCurrentPhase(){
    return this.phases[this.currentIndex];
  }

  // dt in seconds. returns true if transitioned
  update(dt){
    this.elapsedInPhase += dt;
    this.totalElapsed += dt;
    const current = this.getCurrentPhase();
    if(this.elapsedInPhase >= current.duration){
      // advance
      if(this.currentIndex < this.phases.length - 1){
        this.currentIndex += 1;
        this.elapsedInPhase = 0;
        return true;
      }
    }
    return false;
  }

  // expose difficulty params for current phase
  getDifficulty(){
    const p = this.getCurrentPhase();
    return { baseSpeed: p.baseSpeed, spawnRate: p.spawnRate };
  }

  reset(){
    this.currentIndex = 0;
    this.elapsedInPhase = 0;
    this.totalElapsed = 0;
  }
}

module.exports = { LevelManager };
