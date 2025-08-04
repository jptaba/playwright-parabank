// This file contains utility functions for randomizing browser usage and handling storageState for authenticated sessions.
import { devices } from '@playwright/test';

// Use string type for browser names instead of BrowserName type
export function getRandomBrowserProject() {
  const browsers: string[] = ['chromium', 'firefox', 'webkit'];
  const randomIndex = Math.floor(Math.random() * browsers.length);
  return browsers[randomIndex];
}

export function getDeviceForBrowser(browser: string) {
  switch (browser) {
    case 'chromium':
      return devices['Desktop Chrome'];
    case 'firefox':
      return devices['Desktop Firefox'];
    case 'webkit':
      return devices['Desktop Safari'];
    default:
      return devices['Desktop Chrome'];
  }
}

// Placeholder for loading storageState from a file (for authenticated sessions)
export function getStorageStatePath() {
  return './auth/storageState.json';
}

// Placeholder for test data mockup
export function getTestData() {
  return {
    username: 'testuser',
    password: 'testpass',
    // Add more fields as needed
  };
}
