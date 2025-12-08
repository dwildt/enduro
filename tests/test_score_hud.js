const assert = require('assert');
const { ScoreManager } = require('../src/score.cjs');
const { formatHUD } = require('../src/hud.cjs');

const s = new ScoreManager(10);
s.update(1.0);
assert.strictEqual(s.getScore(), 10, '10 points after 1s at 10pts/s');

s.addOvertake(50);
assert.strictEqual(s.getScore(), 60, 'score after overtake +50');

s.update(0.25);
// 0.25*10 = 2.5, floor makes 62
assert.strictEqual(s.getScore(), 62, 'score after additional 0.25s');

const hud = formatHUD({ score: s.getScore(), lives: 3, phase: 2, time: s.getTime() });
assert.ok(hud.includes('Score: 62'));
assert.ok(hud.includes('Lives: 3'));
assert.ok(hud.includes('Phase: 2'));
assert.ok(hud.includes('Time:'));

console.log('test_score_hud: all assertions passed');
