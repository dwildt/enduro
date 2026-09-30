// Tiny Web Audio step sequencer with 2-operator FM voices (Mega Drive flavored).
const NOTE_INDEX = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const LOOKAHEAD = 0.12; // seconds scheduled ahead

export function noteToFreq(note){
  const m = /^([A-G]#?)(\d)$/.exec(note);
  if(!m) return null;
  const midi = 12 * (Number(m[2]) + 1) + NOTE_INDEX[m[1]];
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// split bars into tokens and compute each note's length (following '-' tokens hold it)
export function parseChannel(bars){
  const tokens = bars.join(' ').split(/\s+/).filter(Boolean);
  return tokens.map((tok, i) => {
    if(tok === '-' || tok === '.') return null;
    let len = 1;
    while(tokens[(i + len) % tokens.length] === '-' && len < tokens.length) len++;
    return { tok, len };
  });
}

export default class MusicSequencer {
  constructor(){
    this.ctx = null;
    this.out = null;
    this.timer = null;
    this.muted = localStorage.getItem('enduro_music_muted') === 'true';
  }

  attach(audioContext){
    if(this.ctx) return;
    this.ctx = audioContext;
    this.out = audioContext.createGain();
    this.out.gain.value = this.muted ? 0 : 0.16;
    this.out.connect(audioContext.destination);
    this.noise = audioContext.createBuffer(1, audioContext.sampleRate * 0.3, audioContext.sampleRate);
    const data = this.noise.getChannelData(0);
    for(let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }

  isMuted(){ return this.muted; }
  setMuted(muted){
    this.muted = muted;
    localStorage.setItem('enduro_music_muted', String(muted));
    if(this.out) this.out.gain.setTargetAtTime(muted ? 0 : 0.16, this.ctx.currentTime, 0.05);
  }

  play(track){
    if(!this.ctx) return;
    this.stop();
    this.track = track;
    this.channels = {
      lead: parseChannel(track.lead),
      bass: parseChannel(track.bass),
      drums: parseChannel(track.drums)
    };
    this.stepTime = 60 / track.bpm / 4;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.05;
    this.timer = setInterval(() => this.schedule(), 25);
  }

  stop(){
    if(this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  schedule(){
    while(this.nextTime < this.ctx.currentTime + LOOKAHEAD){
      const t = this.nextTime;
      const { lead, bass, drums } = this.channels;
      const l = lead[this.step % lead.length];
      if(l) this.fm(noteToFreq(l.tok), t, l.len * this.stepTime, { ratio: 2, index: 1.6, type: 'sine', vol: 0.5 });
      const b = bass[this.step % bass.length];
      if(b) this.fm(noteToFreq(b.tok), t, b.len * this.stepTime * 0.9, { ratio: 1, index: 2.5, type: 'triangle', vol: 0.7 });
      const d = drums[this.step % drums.length];
      if(d) this.drum(d.tok, t);
      this.nextTime += this.stepTime;
      this.step++;
    }
  }

  // modulator -> carrier.frequency, carrier -> envelope -> out
  fm(freq, t, dur, { ratio, index, type, vol }){
    if(!freq) return;
    const ctx = this.ctx;
    const carrier = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    const env = ctx.createGain();
    carrier.type = type;
    carrier.frequency.value = freq;
    mod.frequency.value = freq * ratio;
    modGain.gain.setValueAtTime(freq * index, t);
    modGain.gain.exponentialRampToValueAtTime(freq * index * 0.2 + 1, t + dur);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    env.gain.exponentialRampToValueAtTime(vol * 0.5, t + dur * 0.6);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    mod.connect(modGain).connect(carrier.frequency);
    carrier.connect(env).connect(this.out);
    mod.start(t); carrier.start(t);
    mod.stop(t + dur + 0.02); carrier.stop(t + dur + 0.02);
  }

  drum(kind, t){
    const ctx = this.ctx;
    const env = ctx.createGain();
    env.connect(this.out);
    if(kind === 'k'){
      const osc = ctx.createOscillator();
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
      env.gain.setValueAtTime(0.9, t);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(env);
      osc.start(t); osc.stop(t + 0.16);
      return;
    }
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = ctx.createBiquadFilter();
    const snare = kind === 's';
    filter.type = snare ? 'bandpass' : 'highpass';
    filter.frequency.value = snare ? 1800 : 7000;
    const len = snare ? 0.14 : 0.04;
    env.gain.setValueAtTime(snare ? 0.5 : 0.25, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + len);
    src.connect(filter).connect(env);
    src.start(t); src.stop(t + len + 0.01);
  }
}
