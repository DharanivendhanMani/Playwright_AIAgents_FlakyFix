import { test, expect } from '@playwright/test';

async function signUp(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByLabel('Email address').fill('testuser@example.com');
  await page.getByRole('button', { name: 'Sign up' }).click();
}

test('new customer can sign up', async ({ page }) => {
  await signUp(page);
  await expect(page.getByRole('status').filter({ hasText: 'Welcome' })).toHaveText('Welcome, testuser@example.com!');
});

test('sign-up confirms the e-mail address', async ({ page }) => {
  await signUp(page);
  await expect(page.locator('#signup-result')).toContainText('testuser@example.com');
});
