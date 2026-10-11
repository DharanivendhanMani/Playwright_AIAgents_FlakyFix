import { test, expect } from '@playwright/test';

test('customer adds the top recommendation (oyster mushrooms) to the cart', async ({ page }) => {
  await page.goto('/');

  await page.locator('.recommended li').first().getByRole('button').click();

  await expect(page.locator('#cart-items')).toContainText('Oyster Mushrooms');
});
