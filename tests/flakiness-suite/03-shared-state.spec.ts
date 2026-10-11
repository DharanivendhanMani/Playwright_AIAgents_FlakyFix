import { test, expect } from '@playwright/test';

// These two tests were written to run one after the other.

test('customer adds the oyster mushrooms to the cart', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add Oyster Mushrooms to cart' }).click();
  await expect(page.getByTestId('cart-count')).toHaveText('1');
});

test('cart still contains the oyster mushrooms at checkout', async ({ page }) => {
  await page.goto('/');

  // The oyster mushrooms were added in the previous test...
  await expect(page.getByTestId('cart-count')).toHaveText('1');
  await expect(page.locator('#cart-items')).toContainText('Oyster Mushrooms');
});
