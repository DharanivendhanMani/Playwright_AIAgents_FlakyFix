import { test, expect } from '@playwright/test';

test('customer can place an order', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cart', JSON.stringify(['oyster'])));
  await page.goto('/');

  await page.getByRole('button', { name: 'Place order' }).click();

  await expect(page.getByText('Order placed!')).toBeVisible();
});
