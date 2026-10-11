# Flaky-Fix Lab: fix flaky Playwright tests with AI agents

**Mughi's Mushroom (MM Pvt Ltd)** is a small, deliberately flaky shop (mushrooms, tofu and plant milks).
`tests/flakiness-suite/` holds **7 naive tests** that break for real reasons. `tests/solutions/` holds the
**fixed versions**, and `docs/` explains every flake: the issue, the evidence and the fix.

The skill this teaches: **diagnose the root cause, reject band-aids (`waitForTimeout`, `networkidle`,
`workers: 1`), and prove a fix with numbers, not one lucky green run.**

---

## Start here (learner path)

| Step | Do this | Command |
|---|---|---|
| 1 | See the app misbehave: refresh a few times | `npm run dev`, then open http://localhost:3000 (stop with Ctrl+C) |
| 2 | Watch one naive test fail | `npx playwright test 06-network-race --headed --workers=1` |
| 3 | Open its case file and read only **Symptom** and **Where it lives** | [docs/README.md](docs/README.md) |
| 4 | Write the root cause in your own words: *"the test assumes ___, but the app ___"* | n/a |
| 5 | Copy the naive test into your own folder and fix it there | `npm run fix -- 06` then edit `tests/my-fixes/06-network-race.spec.ts` |
| 6 | Prove it (20 runs must all pass) | `npm run test:mine -- 06 --repeat-each=20` |
| 7 | Check for band-aids | `npm run verify-lab:mine` |
| 8 | Compare with the case file's **Real fix** and the answer key | `docs/06-network-race.md`, `tests/solutions/` |

`tests/my-fixes/` starts empty. `tests/solutions/` is the **answer key**, so try your own fix before opening it.

> Port 3000 must be free when running tests (`kill $(lsof -ti :3000)`): Playwright starts its own fresh server.

## The 7 flakes: problem, evidence, fix

| # | Flake | The test assumes... | ...but the app | Baseline | Fixed | Strategy |
|---|---|---|---|---|---|---|
| [01](docs/01-brittle-locator.md) | Brittle locator | a copied CSS class is stable | regenerates it every load | 0% | 20/20 | #1 Role-based locators |
| [02](docs/02-hard-wait.md) | Hard wait | 2 s is enough | takes 1.5–3.5 s (random) | 0–80% | 20/20 | #2 No hard waits |
| [03](docs/03-shared-state.md) | Shared state | test A's cart survives | gives each test a fresh browser | 0% (B) | 20/20 | #3 Isolate state |
| [04](docs/04-loading-state.md) | Loading state | a visible button is ready | ignores clicks for 1.5 s | 0% alone | 20/20 | #4 Loading states |
| [05](docs/05-dynamic-content.md) | Dynamic content | the first recommendation is oyster | shuffles 4 random picks | ~5–10% | 20/20 | #5 Stable identifiers |
| [06](docs/06-network-race.md) | Network race | row exists, so price exists | fills price from a 2nd API | 0% | 20/20 | #7 Network variability |
| [07](docs/07-parallel-collision.md) | Parallel collision | the e-mail is unused | rejects duplicates, tests run in parallel | 0–20% | 20/20 | #8 Parallel data |

*Baseline* = naive suite, 6–10 runs per test. *Fixed* = solutions, 20 runs per test, 4 workers (the full
suite: **180/180 passed**, run twice). Baselines are small samples and for 02/05/07 they genuinely vary.

Strategies #6 (assertions retry, not tests), #9 (trace viewer) and #10 (realistic timeouts) are covered by
the config below and by reading traces: `npx playwright show-trace test-results/<test>/trace.zip`.

## Commands

```bash
npm install && npm run setup     # dependencies + Chromium (once)
npm test                         # naive suite: expect reds
npm run flake-report             # pass rate per test over 10 runs (naive)
npm run test:solutions           # the answer key
npm run fix -- 06                # start your own fix for test 06 in tests/my-fixes/
npm run test:mine -- 06 --repeat-each=20   # run your fixes
npm run verify-lab               # answer key: every flake has a fix + a doc page + no band-aids
npm run verify-lab:mine          # your fixes: band-aid check
npx playwright test -c playwright.solutions.config.ts --repeat-each=20 --workers=4   # the proof
npx playwright test -c playwright.solutions.config.ts --reporter=html && npx playwright show-report
```

Reports and artifacts: the naive suite writes `playwright-report/` and `test-results/`; the solutions suite
writes `playwright-report-solutions/` and `test-results-solutions/` so they never overwrite each other.
A fully green run leaves `test-results*` empty (artifacts are kept for failures only).

## Why the config looks the way it does (strategies #6, #9, #10)

| Setting | Naive suite | Solutions suite | Reason |
|---|---|---|---|
| `retries` | 0 | 0 | Retries hide flakes. A fix must pass first time. |
| `expect.timeout` | 5 s | **10 s** | Worst-case page population is about 5 s (products 3.5 s plus stock 1.5 s); 10 s absorbs a slow CI box without masking a real hang. |
| `actionTimeout` | 5 s | **10 s** | Clicks wait for elements that wait for the API; same headroom. |
| `timeout` (per test) | 15 s | **30 s** | A test is 1–2 page loads plus assertions; generous, not huge. |
| `trace` | retain-on-failure | retain-on-failure | With `retries: 0`, `on-first-retry` would never record. |
| `reuseExistingServer` | false | false | Sign-up state lives in server memory; each run needs a fresh server. |

The naive suite is **deliberately tight** so its failures are loud and specific.

## Layout

```
src/                       app front-end (each flake is labelled in app.js)
server.js                  dependency-free server: slow + stateful API routes
tests/flakiness-suite/     the 7 naive tests: the "before" (never edit)
tests/solutions/           the answer key: the "after"
tests/my-fixes/           YOUR fixes (starts empty; use `npm run fix -- NN`)
docs/                      one case-file page per flake + index
prompts/claude.md          Diagnose -> Fix -> Push back -> Audit prompts + fix rubric
scripts/flake-report.js    pass-rate table
scripts/verify-lab.js      consistency + band-aid check (`--mine` for your own fixes)
scripts/start-fix.js       copies a naive test into tests/my-fixes
.claude/agents/            the Playwright Healer agent (the only agent this lab uses)
.mcp.json                  Playwright MCP servers
playwright.config.ts       naive suite config (tight on purpose)
playwright.solutions.config.ts   answer-key config (realistic timeouts, justified above)
playwright.mine.config.ts        same settings, runs tests/my-fixes
```

## How this lab was made

Be clear about what the AI did and did not do:

| Part | Who |
|---|---|
| App, naive tests, baseline, docs, tooling | Written with **Claude Code** (an AI coding agent) |
| Root-cause predictions for each flake | The author, before seeing the agent's diagnosis |
| The 7 fixes in `tests/solutions/` | Written by Claude Code, **following the rules in the Playwright Healer agent file** |
| Proof of stability | Real runs: `--repeat-each=20 --workers=4`, 180/180 |

The Playwright **Healer sub-agent was not launched** to produce these fixes, so its live browser-debugging
tools (`test_debug`, `browser_snapshot`, ...) were not used. The fixes were audited with the rules below
and checked by `verify-lab` and repeat runs. If you run the Healer yourself, treat its output the same way:
review it, then prove it.

## Using the AI Healer

The Healer agent lives in `.claude/agents/playwright-test-healer.md`. (Playwright also generates a Planner and a
Generator, which create *new* tests from scratch; this lab doesn't need them, and `npm run init-agents`
regenerates all three if you want them.) The Healer edits files **in place**, so keep the originals safe: have it
write to `tests/solutions/` (see [prompts/claude.md](prompts/claude.md)). Then review each fix against the
rubric and `docs/`, and run the 20× proof. Always audit: the agent's first instinct is often a fixed wait.

## Rules of the game
No `waitForTimeout`. No `networkidle` as a crutch. No retries. No `workers: 1` to dodge collisions.
No `.nth()`/`force: true` to dodge strictness. `npm run verify-lab` enforces most of these.

## Known trade-offs
- **05** changes what the test verifies slightly ("add the *top* recommendation" instead of "add oyster").
  The alternative is mocking the recommendations endpoint. See the discussion in its case file.
- **04** can pass on a heavily loaded machine because slow startup outlasts the 1.5 s validation. That is
  the point of the lesson, but it makes the baseline look better than it is.
- Baselines use small samples (6–10 runs); trust the pattern, not the exact percentage.
