# 06 · Network race

**Strategy:** #7 Handle network variability · **Baseline:** 0% pass · **Fixed:** 20/20

## Symptom
```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "$4.99"
Received: "…"
```

## Where it lives
Two sequential calls in [src/app.js:63-78](../src/app.js#L63): rows render after `/api/products`, then price and stock are filled after `/api/stock` (slowed in [server.js:37](../server.js#L37) by 0.5–1.5 s).
```js
const stock = await (await fetch('/api/stock', { cache: 'no-store' })).json();
```

## Root cause
The test assumes that once the product row exists, its price exists too, but the price comes from a second, slower request, so the test reads the placeholder "…" in between.

## Reproduce
```bash
npx playwright test 06-network-race --workers=1
```

## Naive test
```ts
await row.waitFor();
const price = await row.locator('.price').textContent();   // reads once, immediately
expect(price).toBe('$4.99');
```

## Band-aid (don't)
- `waitForTimeout(1500)` before reading.
- `waitForLoadState('networkidle')`.

## Real fix ([tests/solutions/06-network-race.spec.ts](../tests/solutions/06-network-race.spec.ts))
```ts
await expect(row.locator('.price')).toHaveText('$4.99');
```
The assertion retries until the price text arrives. An alternative is to wait for the exact response (`page.waitForResponse('**/api/stock')`), which must be registered *before* the navigation.

## Prove it
```bash
npx playwright test -c playwright.solutions.config.ts 06-network-race --repeat-each=20
```

## Lesson
An element that exists is not an element that is **populated**. Wait for the specific data your assertion depends on.

## Compare with 04
04 is an *action* problem (the click is ignored); 06 is a *data* problem (the value hasn't arrived).
