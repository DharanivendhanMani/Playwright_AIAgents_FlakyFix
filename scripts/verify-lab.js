// Usage: npm run verify-lab            (answer key + docs)
//        npm run verify-lab:mine       (your own fixes in tests/my-fixes: band-aid check only)
// Checks the lab is consistent: every naive test has a fix and a doc page,
// and no fix uses a banned band-aid. Exits 1 on any problem.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const naiveDir = path.join(root, 'tests', 'flakiness-suite');
// `--mine` checks tests/my-fixes (band-aids only, and only for files you have written).
const mine = process.argv.includes('--mine');
const fixDir = path.join(root, 'tests', mine ? 'my-fixes' : 'solutions');
const docsDir = path.join(root, 'docs');

const BANNED = [
  [/waitForTimeout\s*\(/, 'waitForTimeout'],
  [/networkidle/, 'networkidle'],
  [/\.nth\s*\(/, '.nth()'],
  [/force\s*:\s*true/, 'force: true'],
  [/workers\s*:\s*1/, 'workers: 1'],
];

// Drop comments so explanations mentioning a band-aid don't trigger the check.
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/.*$/gm, '');

const problems = [];
const naive = fs.readdirSync(naiveDir).filter((f) => /^\d\d-.*\.spec\.ts$/.test(f)).sort();

for (const file of naive) {
  const name = file.replace('.spec.ts', '');
  const fix = path.join(fixDir, file);
  const doc = path.join(docsDir, `${name}.md`);

  if (!fs.existsSync(fix)) { if (!mine) problems.push(`${name}: missing solution tests/solutions/${file}`); }
  else {
    if (fs.readFileSync(fix, 'utf8') === fs.readFileSync(path.join(naiveDir, file), 'utf8')) {
      problems.push(`${name}: solution is identical to the naive test (not fixed yet)`);
    }
    const code = stripComments(fs.readFileSync(fix, 'utf8'));
    for (const [re, label] of BANNED) if (re.test(code)) problems.push(`${name}: solution uses banned ${label}`);
  }
  if (!mine && !fs.existsSync(doc)) problems.push(`${name}: missing doc page docs/${name}.md`);
}

console.log(`Checked ${naive.length} flakes.`);
if (problems.length) {
  console.error('\nProblems:\n - ' + problems.join('\n - '));
  process.exit(1);
}
console.log('OK: every flake has a fix, a doc page, and no band-aids.');
