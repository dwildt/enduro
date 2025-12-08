const fs = require('fs');
const path = require('path');
try {
  const files = fs.readdirSync(__dirname).filter(f=>f.startsWith('test_') && f.endsWith('.js'));
  files.forEach(f=>{ require(path.join(__dirname,f)); });
  console.log('All tests passed');
  process.exit(0);
} catch(err){
  console.error('Tests failed:', err && err.stack?err.stack:err);
  process.exit(1);
}
