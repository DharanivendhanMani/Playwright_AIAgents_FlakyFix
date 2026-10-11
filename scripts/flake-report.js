// Usage: node scripts/flake-report.js [repeat-each=10] [extra playwright args...]
// Runs the suite N times and prints pass-rate per test (the "show me numbers" step).
const { spawnSync } = require('child_process');
const repeat = process.argv[2] || '10';
const extra = process.argv.slice(3);
const r = spawnSync('npx', ['playwright', 'test', `--repeat-each=${repeat}`, '--reporter=json', ...extra], {
  encoding: 'utf8', maxBuffer: 1 << 28, env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: '' },
});
let report;
try { report = JSON.parse(r.stdout); } catch { console.error(r.stdout.slice(0, 500), r.stderr.slice(0, 500)); process.exit(1); }
const stats = new Map();
(function walk(suite) {
  for (const s of suite.suites || []) walk(s);
  for (const spec of suite.specs || []) {
    const key = `${spec.file}  ›  ${spec.title}`;
    const st = stats.get(key) || { pass: 0, total: 0 };
    for (const t of spec.tests) for (const res of t.results) { st.total++; if (res.status === 'passed') st.pass++; }
    stats.set(key, st);
  }
})({ suites: report.suites });
console.log(`\nFlake report (${repeat} runs per test)\n`);
for (const [k, v] of [...stats].sort()) {
  const pct = Math.round((v.pass / v.total) * 100);
  console.log(`${String(pct).padStart(4)}% pass  (${v.pass}/${v.total})  ${k}`);
}
