import { test, expect } from '@playwright/test';

test('product list shows all nine products', async ({ page }) => {
  await page.goto('/');

  // The list "usually" loads within two seconds.
  await page.waitForTimeout(2000);

  const count = await page.locator('.product-row').count();
  expect(count).toBe(9);
});
