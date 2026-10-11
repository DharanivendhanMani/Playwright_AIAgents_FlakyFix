import { test, expect } from '@playwright/test';

// FIX for 04-loading-state
// Problem: the app ignores "Place order" clicks until cart validation finishes (spinner visible),
//          but the test clicked as soon as the button appeared.
// Fix:     wait for the readiness signal (spinner gone) before acting.
test('customer can place an order', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cart', JSON.stringify(['oyster'])));
  await page.goto('/');

  await expect(page.getByTestId('loading-spinner')).toBeHidden();
  await page.getByRole('button', { name: 'Place order' }).click();

  await expect(page.getByText('Order placed!')).toBeVisible();
});
