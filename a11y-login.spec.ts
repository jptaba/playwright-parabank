import { test, expect } from '@playwright/test';
import { runA11yTest } from './utils/a11yUtils';

test('Parabank login is accessible', async ({ page }) => {
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  await runA11yTest(page);
});
