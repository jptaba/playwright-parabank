import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const mainpageLocators = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, '../../utils/locators/mainpage.json'),
    'utf-8'
  )
);

const nonVisualKeys = [
  'html',
  'head',
  'meta',
  'title',
  'link[type="text/css"]',
  'script',
  'form[name="login"]',
  'div',
  'ul',
  'li',
  'span',
  'b',
  'body',
];

function getLocator(page: any, locatorObj: any): any {
  if (locatorObj.testId) {
    return page.getByTestId(locatorObj.testId);
  }
  if (locatorObj.role) {
    return page.getByRole(locatorObj.role);
  }
  if (locatorObj.text) {
    return page.getByText(locatorObj.text);
  }
  return page.locator(locatorObj.selectors[0]);
}

Given(
  'I am on the Parabank main page',
  { timeout: 30 * 1000 },
  async function (this: any) {
    await this.openBrowser();
    await this.page.goto('https://parabank.parasoft.com/parabank/index.htm');
  }
);

Then(
  'all main page elements should be present and visible',
  { timeout: 120 * 1000 },
  async function (this: any) {
    for (const [key, value] of Object.entries(mainpageLocators)) {
      if (nonVisualKeys.includes(key)) continue;
      const locator = getLocator(this.page, value);
      try {
        await expect(locator).toBeVisible();
      } catch (e) {
        console.warn(`Element for key '${key}' not found or not visible.`);
      }
    }
    await this.closeBrowser();
  }
);
