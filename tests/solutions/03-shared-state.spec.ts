import { test, expect } from '@playwright/test';

// FIX for 03-shared-state
// Problem: the second test relied on the cart created by the first. Every test gets a fresh
//          browser context, so the cart was empty (and would break if run alone or in parallel).
// Fix:     each test builds its own starting state; no test depends on another.

test('customer adds the oyster mushrooms to the cart', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add Oyster Mushrooms to cart' }).click();
  await expect(page.getByTestId('cart-count')).toHaveText('1');
});

test('cart still contains the oyster mushrooms at checkout', async ({ page }) => {
  // Seed the cart before the app loads, instead of assuming a previous test did it.
  await page.addInitScript(() => localStorage.setItem('cart', JSON.stringify(['oyster'])));
  await page.goto('/');

  await expect(page.getByTestId('cart-count')).toHaveText('1');
  await expect(page.locator('#cart-items')).toContainText('Oyster Mushrooms');
});
