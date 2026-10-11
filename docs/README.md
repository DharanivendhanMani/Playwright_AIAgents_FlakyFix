# Flake case files

One page per flake in Mughi's Mushroom. Each page answers: **what breaks, why, how to see it, what the band-aid is, and what the real fix is.**

## How to use these pages
1. Read **Symptom** and **Where it lives**, then stop.
2. Write the root cause in your own words ("the test assumes ___, but the app ___").
3. Try your own fix in `tests/solutions/`.
4. Then read **Root cause** and **Real fix** and compare.

## Index

| # | Flake | Baseline pass rate | Fixed (20 runs) | Article strategy |
|---|---|---|---|---|
| [01](./01-brittle-locator.md) | Generated CSS class changes every load | 0% | 20/20 | #1 Role-based locators |
| [02](./02-hard-wait.md) | Fixed sleep vs random API latency | 0–80% (random) | 20/20 | #2 No hard-coded waits |
| [03](./03-shared-state.md) | Test B depends on test A's cart | 0% (B) | 20/20 | #3 Isolate test state |
| [04](./04-loading-state.md) | Click ignored while spinner shows | 0% alone | 20/20 | #4 Handle loading states |
| [05](./05-dynamic-content.md) | Recommendations shuffle every load | ~5–10% | 20/20 | #5 Stable identifiers |
| [06](./06-network-race.md) | Price arrives from a second API | 0% | 20/20 | #7 Network variability |
| [07](./07-parallel-collision.md) | Same e-mail in parallel tests | 0–20% | 20/20 | #8 Parallel data |

## Reproduce any page's claims
```bash
npx playwright test NN-name --workers=1                                   # the naive test (fails)
npx playwright test NN-name --repeat-each=10                              # baseline pass rate
npx playwright test -c playwright.solutions.config.ts NN-name --repeat-each=20   # the fix
```
Stop anything on port 3000 first (`kill $(lsof -ti :3000)`).
