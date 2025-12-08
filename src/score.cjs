class ScoreManager {
  constructor(pointsPerSec = 10) {
    this.pointsPerSec = pointsPerSec;
    this.score = 0;
    this.time = 0;
  }
  // dt in seconds
  update(dt) {
    this.time += dt;
    this.score += this.pointsPerSec * dt;
  }
  addOvertake(bonus = 50) {
    this.score += bonus;
  }
  getScore() { return Math.floor(this.score); }
  getTime() { return this.time; }
  reset() { this.score = 0; this.time = 0; }
}

module.exports = { ScoreManager };
