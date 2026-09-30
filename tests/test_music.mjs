import assert from 'assert';
import { noteToFreq, parseChannel } from '../src/audio/MusicSequencer.js';
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

// every bar of every track is exactly 16 steps and every note is valid
assert.strictEqual(TRACKS.length, 3);
for(const track of TRACKS){
  for(const bar of [...track.lead, ...track.bass, ...track.drums]){
    assert.strictEqual(bar.split(/\s+/).length, 16, `${track.name}: bar "${bar}" must have 16 steps`);
  }
  for(const bar of [...track.lead, ...track.bass]){
    bar.split(/\s+/).filter(t => t !== '-' && t !== '.').forEach(t => assert.ok(noteToFreq(t), `${track.name}: bad note ${t}`));
  }
}

console.log('test_music: all assertions passed');
