// Usage: npm run fix -- 06
// Copies the naive test whose number starts with 06 into tests/my-fixes/ so you can fix it there.
const fs = require('fs');
const path = require('path');

const num = (process.argv[2] || '').padStart(2, '0');
const naiveDir = path.join(__dirname, '..', 'tests', 'flakiness-suite');
const mineDir = path.join(__dirname, '..', 'tests', 'my-fixes');

const match = fs.readdirSync(naiveDir).find((f) => f.startsWith(num + '-') && f.endsWith('.spec.ts'));
if (!/^\d\d$/.test(num) || !match) {
  console.error('Usage: npm run fix -- <NN>   (e.g. npm run fix -- 06)');
  console.error('Available: ' + fs.readdirSync(naiveDir).filter((f) => f.endsWith('.spec.ts')).join(', '));
  process.exit(1);
}
const dest = path.join(mineDir, match);
if (fs.existsSync(dest)) {
  console.error(`tests/my-fixes/${match} already exists; not overwriting your work.`);
  process.exit(1);
}
fs.mkdirSync(mineDir, { recursive: true });
fs.copyFileSync(path.join(naiveDir, match), dest);
console.log(`Copied to tests/my-fixes/${match}\nNow fix it, then run: npm run test:mine -- ${num} --repeat-each=20`);
