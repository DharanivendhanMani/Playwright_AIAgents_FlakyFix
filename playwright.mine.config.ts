import { defineConfig } from '@playwright/test';
import solutions from './playwright.solutions.config';

// Runs YOUR fixes from tests/my-fixes/ with the same realistic settings as the answer key.
export default defineConfig({
  ...solutions,
  testDir: './tests/my-fixes',
  outputDir: 'test-results-mine',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report-mine', open: 'never' }],
  ],
});
