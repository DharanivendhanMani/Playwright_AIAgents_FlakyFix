# 04 · Acting during a loading state

**Strategy:** #4 Handle loading states explicitly · **Baseline:** 0% when run alone (can pass on a busy machine) · **Fixed:** 20/20

## Symptom
```
Error: expect(locator).toBeVisible() failed

Locator:  getByText('Order placed!')
Expected: visible
Received: hidden
    14 × locator resolved to <p hidden="" role="status" id="order-confirmation">Order placed!</p>
```

## Where it lives
[src/app.js:87-96](../src/app.js#L87): the click handler ignores clicks until validation finishes.
```js
let validating = true;
...
if (validating) return; // silently ignored while the spinner is showing
```
The validation call is slowed in [server.js:38](../server.js#L38) (`VALIDATE_DELAY = 1500`).

## Root cause
The test assumes a visible, enabled button is ready to use, but the app silently drops clicks for 1.5 s while the "Validating cart…" spinner shows. Playwright reports the click as successful because the button *was* clickable; the app simply ignored it.

## Reproduce
```bash
npx playwright test 04-loading-state --workers=1
```
Note that in a heavily parallel run it can pass, because a slow page load lets validation finish before the click. "Passes on a busy machine" is the nasty part.

## Naive test
```ts
await page.goto('/');
await page.getByRole('button', { name: 'Place order' }).click();
await expect(page.getByText('Order placed!')).toBeVisible();
```

## Band-aid (don't)
- `waitForTimeout(2000)`: breaks the day validation takes 2.1 s.
- `click({ force: true })`: makes no difference, the app still drops the click.
- Clicking again in a retry loop without knowing why.

## Real fix ([tests/solutions/04-loading-state.spec.ts](../tests/solutions/04-loading-state.spec.ts))
```ts
await expect(page.getByTestId('loading-spinner')).toBeHidden();
await page.getByRole('button', { name: 'Place order' }).click();
```
Wait for the app's own readiness signal before acting.

## Prove it
```bash
npx playwright test -c playwright.solutions.config.ts 04-loading-state --repeat-each=20
```

## Lesson
"Visible and enabled" is not the same as "ready". Find the signal the app gives (spinner gone, button enabled, network settled) and wait for that.
