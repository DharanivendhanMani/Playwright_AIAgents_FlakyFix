import { test, expect } from '@playwright/test';

// FIX for 05-dynamic-content
// Problem: the recommendations are 4 random products in random order, so "the first one is
//          oyster mushrooms" is true only by chance.
// Fix:     don't assume which product is first. Read what the top recommendation actually is,
//          add it, and assert that same product lands in the cart.
test('customer adds the top recommendation to the cart', async ({ page }) => {
  await page.goto('/');

  const topRecommendation = page.locator('.recommended li').first();
  const label = (await topRecommendation.locator('span').textContent()) ?? '';
  const productName = label.split(' — ')[0]; // "Tofu — only 3 left!" -> "Tofu"

  await topRecommendation.getByRole('button', { name: /^Add .* from recommendations$/ }).click();

  await expect(page.locator('#cart-items')).toContainText(productName);
});
