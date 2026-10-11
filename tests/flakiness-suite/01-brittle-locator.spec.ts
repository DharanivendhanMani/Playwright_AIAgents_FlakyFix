import { test, expect } from '@playwright/test';

test('adding a product puts it in the cart', async ({ page }) => {
  await page.goto('/');

  // Copied from DevTools when the test was recorded.
  await page.locator('.css-1k9d2x').first().click();

  await expect(page.getByTestId('cart-count')).toHaveText('1');
});
