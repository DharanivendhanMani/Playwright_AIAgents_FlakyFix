import { test, expect } from '@playwright/test';

// FIX for 02-hard-wait
// Problem: waitForTimeout(2000) guessed the API latency (it is a random 1.5-3.5s),
//          and .count() reads once without retrying.
// Fix:     a web-first assertion retries until the 9 rows exist, so it waits exactly
//          as long as the API takes - no magic number.
test('product list shows all nine products', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('.product-row')).toHaveCount(9);
});
