import { test, expect } from '@playwright/test';

// FIX for 01-brittle-locator
// Problem: '.css-1k9d2x' is a generated class that changes on every page load, so it never matches.
// Fix:     locate the button the way a user finds it - by role and accessible name.
//          getByRole also auto-waits for the product list to render.
test('adding a product puts it in the cart', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Add Oyster Mushrooms to cart' }).click();

  await expect(page.getByTestId('cart-count')).toHaveText('1');
});
