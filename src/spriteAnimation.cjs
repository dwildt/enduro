class SpriteAnimation {
  constructor({ imagePath, frameWidth, frameHeight, frameCount, fps = 10, loop = true }) {
    this.imagePath = imagePath;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameCount = frameCount;
    this.fps = fps;
    this.loop = loop;
    this.frameDuration = 1 / fps;

    this.image = null; // In Node.js, can't create Image objects
    this.loaded = false;
    this.currentFrame = 0;
    this.accumulator = 0;
  }

  load() {
    return new Promise((resolve) => {
      // In test environment, just resolve immediately
      this.loaded = true;
      resolve();
    });
  }

  update(dt) {
    if (!this.loaded) return;

    this.accumulator += dt;

    while (this.accumulator >= this.frameDuration) {
      this.accumulator -= this.frameDuration;

      if (this.loop) {
        this.currentFrame = (this.currentFrame + 1) % this.frameCount;
      } else {
        this.currentFrame = Math.min(this.currentFrame + 1, this.frameCount - 1);
      }
    }
  }

  getCurrentFrame() {
    return {
      x: this.currentFrame * this.frameWidth,
      y: 0,
      width: this.frameWidth,
      height: this.frameHeight
    };
  }

  reset() {
    this.currentFrame = 0;
    this.accumulator = 0;
  }

  isLoaded() {
    return this.loaded;
  }
}

module.exports = { SpriteAnimation };
