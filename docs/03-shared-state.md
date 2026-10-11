# 03 · Shared state between tests

**Strategy:** #3 Isolate test state · **Baseline:** test B 0% pass (test A always passes) · **Fixed:** 20/20

## Symptom
```
Error: expect(locator).toHaveText(expected) failed

Locator:  getByTestId('cart-count')
Expected: "1"
Received: "0"
    14 × locator resolved to <span id="cart-count" data-testid="cart-count">0</span>
```

## Where it lives
[src/app.js:26](../src/app.js#L26): the cart is stored in the browser's `localStorage`, which is empty in every new Playwright context.
```js
const getCart = () => JSON.parse(localStorage.getItem('cart') || '[]');
```

## Root cause
Test B assumes test A already put oyster mushrooms in the cart, but Playwright gives each test a fresh browser context, so the cart is empty. In a system with shared server state it would instead pass or fail depending on test order, which is worse.

## Reproduce
```bash
npx playwright test 03-shared-state --workers=1
```
Test A ("adds ... to the cart") passes; test B fails.

## Naive test
```ts
test('cart still contains the oyster mushrooms at checkout', async ({ page }) => {
  await page.goto('/');
  // The oyster mushrooms were added in the previous test...
  await expect(page.getByTestId('cart-count')).toHaveText('1');
```

## Band-aid (don't)
- `test.describe.configure({ mode: 'serial' })` plus sharing one `page`: couples the tests and stops working when you run one alone or in parallel.
- Re-ordering files so A runs first.

## Real fix ([tests/solutions/03-shared-state.spec.ts](../tests/solutions/03-shared-state.spec.ts))
```ts
await page.addInitScript(() => localStorage.setItem('cart', JSON.stringify(['oyster'])));
await page.goto('/');
```
Each test builds exactly the state it needs before the app loads.

## Prove it
```bash
npx playwright test -c playwright.solutions.config.ts 03-shared-state --repeat-each=20
```

## Lesson
Every test must be able to run **alone, first, and in parallel** with any other test.
