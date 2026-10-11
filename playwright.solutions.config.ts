import { defineConfig } from '@playwright/test';
import base from './playwright.config';

/**
 * Runs the FIXED tests in tests/solutions/ with realistic timeouts (strategy #10).
 *
 * The baseline config stays deliberately tight so the naive suite fails loudly.
 * Here every value is chosen against what the app actually does:
 *
 *   slowest API call      3.5 s  (/api/products)
 *   + stock API           1.5 s  (runs after products)  -> ~5 s worst case for the page to be fully populated
 *   + cart validation     1.5 s  (runs in parallel)
 *
 * - expect.timeout 10 s   ~2x the 5 s worst-case chain: absorbs CI slowness without hiding real hangs.
 * - actionTimeout  10 s   same reasoning for click/fill (they wait for the element, which waits for the API).
 * - timeout        30 s   a whole test is 1-2 page loads plus a few assertions; 30 s is generous, not huge.
 * - retries         0     a fix must pass first time; retries would hide the very flakes we removed.
 * - trace  retain-on-failure   with retries 0, 'on-first-retry' would never record anything.
 */
export default defineConfig({
  ...base,
  testDir: './tests/solutions',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: 0,
  outputDir: 'test-results-solutions',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report-solutions', open: 'never' }],
  ],
  use: {
    ...base.use,
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
  },
});
