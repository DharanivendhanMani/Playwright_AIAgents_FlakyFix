import { test, expect } from '@playwright/test';

test('oyster row shows its price once the list has rendered', async ({ page }) => {
  await page.goto('/');

  const row = page.getByTestId('product-oyster');
  await row.waitFor();

  // The row exists, so its details must be there too.
  const price = await row.locator('.price').textContent();
  expect(price).toBe('$4.99');
});
