# 02 · Hard-coded wait

**Strategy:** #2 Never use hard-coded waits · **Baseline:** 0–80% (random, varies by run) · **Fixed:** 20/20

## Symptom
```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 9
Received: 0
```

## Where it lives
[server.js:36](../server.js#L36): the products API takes a random 1.5–3.5 s.
```js
const PRODUCTS_DELAY = () => jitter(1500, 3500);
```

## Root cause
The test assumes 2 seconds is always enough for the list to load, but the API takes a random 1.5–3.5 s, so on slower responses the rows don't exist yet. Reading with `.count()` makes it worse because it reads once and never retries.

## Reproduce
```bash
npx playwright test 02-hard-wait --repeat-each=10
```
You'll see a mix of passes and failures: that randomness is the flake.

## Naive test
```ts
await page.waitForTimeout(2000);
const count = await page.locator('.product-row').count();
expect(count).toBe(9);
```

## Band-aid (don't)
- `waitForTimeout(5000)`: passes more often, still guesses, and slows every run by 5 s.
- `waitForLoadState('networkidle')`: discouraged, and the stock call can still be pending.

## Real fix ([tests/solutions/02-hard-wait.spec.ts](../tests/solutions/02-hard-wait.spec.ts))
```ts
await expect(page.locator('.product-row')).toHaveCount(9);
```
A web-first assertion retries until the condition is true, so it waits exactly as long as the API takes.

## Prove it
```bash
npx playwright test -c playwright.solutions.config.ts 02-hard-wait --repeat-each=20
```

## Lesson
Wait for a **condition**, not for a **duration**. Playwright's auto-retrying assertions are the first tool to reach for.
