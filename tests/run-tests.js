try {
  require('./test_game_loop.js');
  console.log('All tests passed');
  process.exit(0);
} catch (err) {
  console.error('Tests failed:', err && err.stack ? err.stack : err);
  process.exit(1);
}
