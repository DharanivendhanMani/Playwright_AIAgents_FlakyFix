# 01 · Brittle locator

**Strategy:** #1 Use role-based locators · **Baseline:** 0% pass · **Fixed:** 20/20

## Symptom
```
TimeoutError: locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('.css-1k9d2x').first()
```

## Where it lives
[src/app.js:19](../src/app.js#L19): the button class is regenerated on every page load.
```js
const BTN_CLASS = 'css-' + Math.random().toString(36).slice(2, 8);
```

## Root cause
The test assumes the button always has the class `.css-1k9d2x` (copied from DevTools), but the app generates a new class on every load, so the selector can never match. Real apps do this with CSS-in-JS hashes and build tools.

## Reproduce
```bash
npx playwright test 01-brittle-locator --workers=1
```
Open the app and inspect the "Add to cart" button twice: the class differs.

## Naive test ([tests/flakiness-suite/01-brittle-locator.spec.ts](../tests/flakiness-suite/01-brittle-locator.spec.ts))
```ts
await page.locator('.css-1k9d2x').first().click();
```

## Band-aid (don't)
- Another structural selector such as `#product-list > div:nth-child(1) button`. It breaks the first time the layout changes.
- `.first()` on a class that can't match: it only hides the strictness error.

## Real fix ([tests/solutions/01-brittle-locator.spec.ts](../tests/solutions/01-brittle-locator.spec.ts))
```ts
await page.getByRole('button', { name: 'Add Oyster Mushrooms to cart' }).click();
```
The button's accessible name comes from its `aria-label`, which is what a user (or screen reader) actually sees. `getByRole` also auto-waits for the list to render.

## Prove it
```bash
npx playwright test -c playwright.solutions.config.ts 01-brittle-locator --repeat-each=20
```

## Lesson
Target **what the user perceives** (role, label, text), not implementation details (generated classes, DOM position).
