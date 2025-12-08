// AABB collision and simple lives/invulnerability manager (CommonJS)
function aabbOverlap(ax, ay, aw, ah, bx, by, bw, bh){
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

class PlayerLives {
  constructor(lives = 3, invulSeconds = 1.5){
    this.maxLives = lives;
    this.lives = lives;
    this.invulSeconds = invulSeconds;
    this.invulTimer = 0;
  }

  isAlive(){ return this.lives > 0 }
  isInvulnerable(){ return this.invulTimer > 0 }
  getLives(){ return this.lives }

  // call every frame with dt in seconds
  update(dt){
    if(this.invulTimer > 0){
      this.invulTimer = Math.max(0, this.invulTimer - dt);
    }
  }

  // Attempt to apply a hit; returns true if hit processed (life lost), false if ignored due to invulnerability or already dead
  hit(){
    if(!this.isAlive()) return false;
    if(this.isInvulnerable()) return false;
    this.lives -= 1;
    this.invulTimer = this.invulSeconds;
    return true;
  }
}

module.exports = { aabbOverlap, PlayerLives };
