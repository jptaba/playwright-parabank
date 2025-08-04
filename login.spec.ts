import { test, expect } from '@playwright/test';

// Parabank login test
// This test checks that a user can log in successfully and see the Accounts Overview page

test('Parabank login works', async ({ page }) => {
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  await page.fill('input[name="username"]', process.env.PARABANK_USER || '');
  await page.fill('input[name="password"]', process.env.PARABANK_PASS || '');
  await page.click('input[type="submit"]');
  await expect(page).toHaveURL(/overview/);
  await expect(page.locator('h1.title')).toContainText('Accounts Overview');
});
