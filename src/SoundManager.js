export default class SoundManager {
  constructor() {
    this.audioContext = null;
    this.sfxMuted = false;      // SFX enabled by default
    this.engineMuted = true;    // Engine disabled by default
    this.engineOscillator = null;
    this.engineGain = null;
  }

  init() {
    // Load mute preferences from localStorage
    const storedSfx = localStorage.getItem('enduro_sfx_muted');
    this.sfxMuted = storedSfx === null ? false : storedSfx === 'true';

    const storedEngine = localStorage.getItem('enduro_engine_muted');
    this.engineMuted = storedEngine === null ? true : storedEngine === 'true';

    // Create AudioContext (lazily initialized on first user interaction)
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  setSfxMuted(muted) {
    this.sfxMuted = muted;
    localStorage.setItem('enduro_sfx_muted', muted.toString());
  }

  setEngineMuted(muted) {
    this.engineMuted = muted;
    localStorage.setItem('enduro_engine_muted', muted.toString());
    if (muted && this.engineOscillator) {
      this.stopEngine();
    }
  }

  isSfxMuted() {
    return this.sfxMuted;
  }

  isEngineMuted() {
    return this.engineMuted;
  }

  // Internal: play a tone
  _playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (this.sfxMuted || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playHit() {
    this._playTone(120, 0.15, 'sawtooth', 0.3);
  }

  playCheckpoint() {
    if (this.sfxMuted || !this.audioContext) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
    osc.frequency.linearRampToValueAtTime(800, this.audioContext.currentTime + 0.3);
    gain.gain.setValueAtTime(0.25, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);
  }

  playGameOver() {
    if (this.sfxMuted || !this.audioContext) return;
    [600, 400, 200].forEach((freq, i) => {
      setTimeout(() => this._playTone(freq, 0.2, 'sine', 0.3), i * 200);
    });
  }

  playPowerUp() {
    this._playTone(800, 0.1, 'sine', 0.2);
  }

  playLaneChange() {
    this._playTone(600, 0.05, 'sine', 0.15);
  }

  playTimerBeep() {
    this._playTone(700, 0.08, 'sine', 0.25);
  }

  startEngine(boosted = false) {
    if (this.engineMuted || !this.audioContext || this.engineOscillator) return;

    this.engineOscillator = this.audioContext.createOscillator();
    this.engineGain = this.audioContext.createGain();

    this.engineOscillator.type = 'sawtooth';
    const frequency = boosted ? 150 : 90;
    const volume = boosted ? 0.10 : 0.06;

    this.engineOscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    this.engineGain.gain.setValueAtTime(volume, this.audioContext.currentTime);

    this.engineOscillator.connect(this.engineGain);
    this.engineGain.connect(this.audioContext.destination);
    this.engineOscillator.start();
  }

  updateEngineBoost(isBoosted) {
    if (!this.engineOscillator || !this.audioContext) return;

    const frequency = isBoosted ? 150 : 90;
    const volume = isBoosted ? 0.10 : 0.06;
    const time = this.audioContext.currentTime;

    this.engineOscillator.frequency.linearRampToValueAtTime(frequency, time + 0.3);
    this.engineGain.gain.linearRampToValueAtTime(volume, time + 0.3);
  }

  stopEngine() {
    if (this.engineOscillator) {
      this.engineOscillator.stop();
      this.engineOscillator = null;
      this.engineGain = null;
    }
  }
}
