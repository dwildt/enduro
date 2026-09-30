// Local top 5 ranking shared by both modes (one localStorage key per mode).
export const RANKING_SIZE = 5;

function defaultStorage(){
  try { return globalThis.localStorage || null; } catch(_e){ return null; }
}

export function loadRanking(key, storage = defaultStorage()){
  try {
    const list = JSON.parse(storage.getItem(key));
    return Array.isArray(list) ? list : [];
  } catch(_e){ return []; }
}

// store the score in the top 5; returns its rank (0-based) or -1
export function saveScore(key, score, stage, storage = defaultStorage()){
  const entry = { score: Math.floor(score), stage, at: Date.now() };
  const ranking = [...loadRanking(key, storage), entry].sort((a, b) => b.score - a.score).slice(0, RANKING_SIZE);
  try { storage.setItem(key, JSON.stringify(ranking)); } catch(_e){ /* storage unavailable */ }
  return ranking.indexOf(entry);
}
