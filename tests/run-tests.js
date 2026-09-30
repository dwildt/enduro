const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  try {
    const files = fs.readdirSync(__dirname).filter(f => f.startsWith('test_'));
    // CommonJS tests (.js) are required; ES module tests (.mjs) are imported
    for (const f of files.filter(f => f.endsWith('.js'))) {
      require(path.join(__dirname, f));
    }
    for (const f of files.filter(f => f.endsWith('.mjs'))) {
      await import(pathToFileURL(path.join(__dirname, f)).href);
    }
    console.log('All tests passed');
    process.exit(0);
  } catch(err){
    console.error('Tests failed:', err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
