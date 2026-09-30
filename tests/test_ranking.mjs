import assert from 'assert';
import { loadRanking, saveScore, RANKING_SIZE } from '../src/ranking.js';

function memoryStorage(initial = {}){
  const data = { ...initial };
  return {
    getItem: k => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    data
  };
}

// empty and corrupted storage load as an empty ranking
assert.deepStrictEqual(loadRanking('k', memoryStorage()), []);
assert.deepStrictEqual(loadRanking('k', memoryStorage({ k: '{not json' })), []);
assert.deepStrictEqual(loadRanking('k', memoryStorage({ k: '{"a":1}' })), []);
assert.deepStrictEqual(loadRanking('k', null), []);

// scores are floored, sorted descending and the rank is returned
let s = memoryStorage();
assert.strictEqual(saveScore('k', 100.7, 1, s), 0);
assert.strictEqual(saveScore('k', 300, 2, s), 0);
assert.strictEqual(saveScore('k', 200, 1, s), 1);
assert.deepStrictEqual(loadRanking('k', s).map(r => r.score), [300, 200, 100]);
assert.strictEqual(loadRanking('k', s)[0].stage, 2);

// ranking is capped and a low score outside the top returns -1
for(let i = 0; i < RANKING_SIZE; i++) saveScore('k', 1000 + i, 3, s);
assert.strictEqual(loadRanking('k', s).length, RANKING_SIZE);
assert.strictEqual(saveScore('k', 50, 1, s), -1);
assert.strictEqual(saveScore('k', 1002.5, 4, s), 3, 'ties keep the older entry first');

// keys are independent per mode
s = memoryStorage();
saveScore('classic', 10, 1, s);
assert.strictEqual(loadRanking('outrun', s).length, 0);
assert.strictEqual(loadRanking('classic', s).length, 1);

console.log('test_ranking: all assertions passed');
