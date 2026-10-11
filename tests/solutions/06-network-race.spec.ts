import { test, expect } from '@playwright/test';

// FIX for 06-network-race
// Problem: the row renders after /api/products, but the price arrives later from /api/stock.
//          The test read the price as soon as the row existed.
// Fix:     a web-first assertion retries until the price text is actually there.
test('oyster row shows its price once the list has rendered', async ({ page }) => {
  await page.goto('/');

  const row = page.getByTestId('product-oyster');
  await expect(row.locator('.price')).toHaveText('$4.99');
});
