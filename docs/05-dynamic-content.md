# 05 · Dynamic content

**Strategy:** #5 Stable identifiers for dynamic content · **Baseline:** about 5–10% pass (pure chance) · **Fixed:** 20/20

## Symptom
```
Error: expect(locator).toContainText(expected) failed

Locator: locator('#cart-items')
Expected substring: "Oyster Mushrooms"
Received string:    "Wild Mushrooms"
```
Run it again and the "Received" product is different. That's the clue.

## Where it lives
[src/app.js:43](../src/app.js#L43): `renderRecommended()` shuffles the catalog and shows 4 random items, each with a random "only N left!" label.

## Root cause
The test assumes the first recommendation is always oyster mushrooms, but the app shows 4 random products in random order, so oyster is first only about 1 time in 9 (and not shown at all 5 times in 9).

## Reproduce
```bash
npx playwright test 05-dynamic-content --repeat-each=10
```

## Naive test
```ts
await page.locator('.recommended li').first().getByRole('button').click();
await expect(page.locator('#cart-items')).toContainText('Oyster Mushrooms');
```

## Band-aid (don't)
- `.nth(2)` or `.first()` that happens to match on your run.
- Retrying the test until the shuffle cooperates.
- Targeting `rec-oyster` directly: oyster isn't always among the 4 shown, so that is a different flaky test.

## Real fix ([tests/solutions/05-dynamic-content.spec.ts](../tests/solutions/05-dynamic-content.spec.ts))
```ts
const topRecommendation = page.locator('.recommended li').first();
const label = (await topRecommendation.locator('span').textContent()) ?? '';
const productName = label.split(' — ')[0];

await topRecommendation.getByRole('button', { name: /^Add .* from recommendations$/ }).click();
await expect(page.locator('#cart-items')).toContainText(productName);
```
The test no longer predicts the shuffle; it checks that **whatever it clicked** ends up in the cart.

## Prove it
```bash
npx playwright test -c playwright.solutions.config.ts 05-dynamic-content --repeat-each=20
```

## Lesson
When the data is random, don't assert a fixed value. Either control the data (a seed or mock) or assert a **relationship** (what I clicked equals what I got).

## Discussion
This fix changes what the test verifies slightly ("add the top recommendation" instead of "add oyster"). Alternative: mock the recommendation endpoint so the order is deterministic.
