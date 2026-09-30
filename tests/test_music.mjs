import assert from 'assert';
import { noteToFreq, parseChannel, nextBpm } from '../src/audio/MusicSequencer.js';
import { TRACKS } from '../src/audio/tracks.js';

assert.strictEqual(noteToFreq('A4'), 440);
assert.ok(Math.abs(noteToFreq('C5') - 523.25) < 0.01);
assert.ok(Math.abs(noteToFreq('A#1') - 58.27) < 0.01);
assert.strictEqual(noteToFreq('-'), null);

// '-' holds the note, '.' is a rest
const ch = parseChannel(['E5 - - . G5 -']);
assert.deepStrictEqual(ch[0], { tok: 'E5', len: 3 });
assert.strictEqual(ch[1], null);
assert.strictEqual(ch[3], null);
assert.deepStrictEqual(ch[4], { tok: 'G5', len: 2 });

// every bar of every track is exactly 16 steps, notes and drum hits are valid
assert.strictEqual(TRACKS.length, 7);
assert.strictEqual(new Set(TRACKS.map(t => t.name)).size, TRACKS.length, 'station names are unique');
for(const track of TRACKS){
  assert.ok(track.name && track.genre, 'every station has a name and a genre');
  assert.ok(track.name.length <= 18 && track.genre.length <= 18, `${track.name}: name/genre fit the radio screen`);
  const guitar = track.guitar || [];
  for(const bar of [...track.lead, ...track.bass, ...track.drums, ...guitar]){
    assert.strictEqual(bar.split(/\s+/).length, 16, `${track.name}: bar "${bar}" must have 16 steps`);
  }
  for(const bar of [...track.lead, ...track.bass, ...guitar]){
    bar.split(/\s+/).filter(t => t !== '-' && t !== '.').forEach(t => assert.ok(noteToFreq(t), `${track.name}: bad note ${t}`));
  }
  for(const bar of track.drums){
    bar.split(/\s+/).forEach(t => assert.ok(['k', 's', 'h', 'x', '.'].includes(t), `${track.name}: bad drum hit ${t}`));
  }
  // channels loop together: each channel length divides the longest one
  const lengths = [track.lead, track.bass, track.drums, guitar].filter(c => c.length).map(c => c.length);
  lengths.forEach(n => assert.strictEqual(Math.max(...lengths) % n, 0, `${track.name}: channel lengths must align`));
  if(track.bpmEnd) assert.ok(track.bpmEnd > track.bpm, `${track.name}: bpmEnd must be faster`);
}

// accelerating tracks speed up every loop and stop at bpmEnd
const king = TRACKS.find(t => t.bpmEnd);
let bpm = king.bpm;
bpm = nextBpm(bpm, king);
assert.strictEqual(bpm, king.bpm + king.bpmStep);
for(let i = 0; i < 50; i++) bpm = nextBpm(bpm, king);
assert.strictEqual(bpm, king.bpmEnd);

console.log('test_music: all assertions passed');
