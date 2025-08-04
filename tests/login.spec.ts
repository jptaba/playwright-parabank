import dotenv from 'dotenv';
dotenv.config();
import { test, expect } from '@playwright/test';

// Parabank login test
// This test checks that a user can log in successfully and see the Accounts Overview page

test('Parabank login works', async ({ page }) => {
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  const username = (process.env.PARABANK_USER || '').trim();
  const password = (process.env.PARABANK_PASS || '').trim();
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('input[type="submit"]');
  await expect(page).toHaveURL(/overview/);
  await expect(
    page.getByRole('heading', { name: 'Accounts Overview' })
  ).toBeVisible();
});
