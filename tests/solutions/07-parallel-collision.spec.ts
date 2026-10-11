import { test, expect, type Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

// FIX for 07-parallel-collision
// Problem: both tests registered 'testuser@example.com'; the server rejects duplicates, so
//          whichever test ran second (they run in parallel) failed.
// Fix:     every test registers its own unique e-mail. No shared data, no need for workers: 1.

async function signUp(page: Page, email: string) {
  await page.goto('/');
  await page.getByLabel('Email address').fill(email);
  await page.getByRole('button', { name: 'Sign up' }).click();
}

test('new customer can sign up', async ({ page }) => {
  const email = `${faker.string.uuid()}@example.com`;
  await signUp(page, email);
  await expect(page.locator('#signup-result')).toHaveText(`Welcome, ${email}!`);
});

test('sign-up confirms the e-mail address', async ({ page }) => {
  const email = `${faker.string.uuid()}@example.com`;
  await signUp(page, email);
  await expect(page.locator('#signup-result')).toContainText(email);
});
