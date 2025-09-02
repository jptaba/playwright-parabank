import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const usbankLocators = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, '../utils/locators/usbank.json'),
    'utf-8'
  )
);

test.use({ browserName: 'chromium' });

test('US Bank homepage loads and displays main elements', async ({ page }) => {
  await page.goto('https://www.usbank.com');
  await expect(page).toHaveTitle(/U.S. Bank/);
  await expect(page.locator(usbankLocators.header.selectors[0])).toBeVisible();
  await expect(page.locator(usbankLocators.footer.selectors[0])).toBeVisible();
});
