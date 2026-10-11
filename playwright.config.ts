import { defineConfig, devices } from '@playwright/test';

/**
 * Baseline config for the flakiness lab.
 * - retries: 0 on purpose, so flakes surface instead of being hidden.
 * - Timeouts are short and explicit; tuning them is Phase 6 (strategy #10).
 */
export default defineConfig({
  testDir: './tests/flakiness-suite',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 15_000,
  expect: { timeout: 5_000 },
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:3000',
    actionTimeout: 5_000,
    trace: 'retain-on-failure', // retries are 0, so 'on-first-retry' would never record
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    // Always start fresh: the sign-up store lives in server memory.
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
