function formatHUD(state){
  const score = typeof state.score === 'number' ? state.score : 0;
  const lives = typeof state.lives === 'number' ? state.lives : 0;
  const phase = typeof state.phase === 'number' ? state.phase : 1;
  const time = typeof state.time === 'number' ? state.time : 0;
  return `Score: ${score}  Lives: ${lives}  Phase: ${phase}  Time: ${time.toFixed(1)}s`;
}
module.exports = { formatHUD };
