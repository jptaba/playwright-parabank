import { defineConfig, devices } from '@playwright/test';
import {
  getDeviceForBrowser,
  getStorageStatePath,
} from './utils/frameworkUtils';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 3 : undefined, // Increase for more parallelization
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['allure-playwright'], // Allure reporting
    // Add more reporters as needed
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://parabank.parasoft.com/parabank/index.htm', // Parabank as test page

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    // storageState: getStorageStatePath(), // Disabled for now
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...getDeviceForBrowser('chromium'),
        headless: false,
        // storageState: getStorageStatePath(), // Disabled for now
      },
    },
    {
      name: 'firefox',
      use: {
        ...getDeviceForBrowser('firefox'),
        headless: false,
        // storageState: getStorageStatePath(), // Disabled for now
      },
    },
    {
      name: 'webkit',
      use: {
        ...getDeviceForBrowser('webkit'),
        headless: false,
        // storageState: getStorageStatePath(), // Disabled for now
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

// ---
// Cucumber, Vault, CI/CD, a11y, mocksmtp, email, locator healing, fallback selectors, and crawling are scaffolded in utils/ and require further implementation.
// See utils/ for placeholders and integration points.
