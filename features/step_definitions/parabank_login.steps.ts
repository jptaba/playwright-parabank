import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const loginLocators = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, '../../utils/locators/login.json'),
    'utf-8'
  )
);

function getLocator(page: any, locatorObj: any): any {
  // Try all selectors in order, return the first visible one
  const selectors = [
    ...(locatorObj.selectors || []),
    locatorObj.fallback ? [locatorObj.fallback] : [],
  ]
    .flat()
    .filter(Boolean);
  // If testId exists, try it first, but only if it's present on the page
  if (locatorObj.testId) {
    selectors.unshift(`[data-testid='${locatorObj.testId}']`);
  }
  // If role/text exists, add them as well
  if (locatorObj.role) selectors.unshift(`role=${locatorObj.role}`);
  if (locatorObj.text) selectors.unshift(`text=${locatorObj.text}`);
  // Return a locator that tries all selectors in order
  return {
    async fill(value: string) {
      for (const sel of selectors) {
        const loc = sel.startsWith('role=')
          ? page.getByRole(locatorObj.role)
          : sel.startsWith('text=')
          ? page.getByText(locatorObj.text || sel.replace('text=', ''))
          : sel.startsWith('[data-testid=')
          ? page.getByTestId(locatorObj.testId)
          : page.locator(sel);
        if (await loc.isVisible().catch(() => false)) {
          console.log('Filling using selector:', sel);
          return loc.fill(value);
        }
      }
      throw new Error(
        'No visible selector found for fill: ' + JSON.stringify(locatorObj)
      );
    },
    async click() {
      for (const sel of selectors) {
        const loc = sel.startsWith('role=')
          ? page.getByRole(locatorObj.role)
          : sel.startsWith('text=')
          ? page.getByText(locatorObj.text || sel.replace('text=', ''))
          : sel.startsWith('[data-testid=')
          ? page.getByTestId(locatorObj.testId)
          : page.locator(sel);
        if (await loc.isVisible().catch(() => false)) {
          console.log('Clicking using selector:', sel);
          return loc.click();
        }
      }
      throw new Error(
        'No visible selector found for click: ' + JSON.stringify(locatorObj)
      );
    },
    async isVisible() {
      for (const sel of selectors) {
        const loc = sel.startsWith('role=')
          ? page.getByRole(locatorObj.role)
          : sel.startsWith('text=')
          ? page.getByText(locatorObj.text || sel.replace('text=', ''))
          : sel.startsWith('[data-testid=')
          ? page.getByTestId(locatorObj.testId)
          : page.locator(sel);
        if (await loc.isVisible().catch(() => false)) {
          return true;
        }
      }
      return false;
    },
    // Return the first visible Playwright Locator (for expect)
    async locator() {
      for (const sel of selectors) {
        const loc = sel.startsWith('role=')
          ? page.getByRole(locatorObj.role)
          : sel.startsWith('text=')
          ? page.getByText(locatorObj.text || sel.replace('text=', ''))
          : sel.startsWith('[data-testid=')
          ? page.getByTestId(locatorObj.testId)
          : page.locator(sel);
        if (await loc.isVisible().catch(() => false)) {
          return loc;
        }
      }
      // fallback: just return the first selector as a locator
      return page.locator(selectors[0]);
    },
  };
}

Given(
  'I am on the Parabank login page',
  { timeout: 30 * 1000 },
  async function (this: any) {
    await this.openBrowser();
    await this.page.goto('https://parabank.parasoft.com/parabank/index.htm');
  }
);

When(
  'I log in with valid credentials',
  { timeout: 30 * 1000 },
  async function (this: any) {
    console.log('Current page URL before login:', await this.page.url());
    // Check and log username input
    const usernameLocator = getLocator(this.page, loginLocators.usernameInput);
    const usernameVisible = await usernameLocator
      .isVisible()
      .catch(() => false);
    console.log(
      'Trying username selector:',
      loginLocators.usernameInput,
      'Visible:',
      usernameVisible
    );
    if (!usernameVisible) {
      await this.page.screenshot({ path: 'login-username-missing.png' });
      throw new Error('Username input not found or not visible');
    }
    await usernameLocator.fill(process.env.PARABANK_USER || '');

    // Check and log password input
    const passwordLocator = getLocator(this.page, loginLocators.passwordInput);
    const passwordVisible = await passwordLocator
      .isVisible()
      .catch(() => false);
    console.log(
      'Trying password selector:',
      loginLocators.passwordInput,
      'Visible:',
      passwordVisible
    );
    if (!passwordVisible) {
      await this.page.screenshot({ path: 'login-password-missing.png' });
      throw new Error('Password input not found or not visible');
    }
    await passwordLocator.fill(process.env.PARABANK_PASS || '');

    // Check and log login button
    const loginBtnLocator = getLocator(this.page, loginLocators.loginButton);
    const loginBtnVisible = await loginBtnLocator
      .isVisible()
      .catch(() => false);
    console.log(
      'Trying login button selector:',
      loginLocators.loginButton,
      'Visible:',
      loginBtnVisible
    );
    if (!loginBtnVisible) {
      await this.page.screenshot({ path: 'login-button-missing.png' });
      throw new Error('Login button not found or not visible');
    }
    await loginBtnLocator.click();
    console.log('Login button clicked.');
  }
);

Then(
  'I should see the account overview page',
  { timeout: 30 * 1000 },
  async function (this: any) {
    await expect(this.page).toHaveURL(/overview/);
    const overviewHeaderLocator = await getLocator(
      this.page,
      loginLocators.accountOverviewHeader
    ).locator();
    await expect(overviewHeaderLocator).toContainText('Accounts Overview');
  }
);

Then('I log out', { timeout: 30 * 1000 }, async function (this: any) {
  await getLocator(this.page, loginLocators.logoutLink).click();
  await expect(this.page).toHaveURL(/index.htm/);
  await this.closeBrowser();
});
