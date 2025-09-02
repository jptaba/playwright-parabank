import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const usbankLocators = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, '../../utils/locators/usbank.json'),
    'utf-8'
  )
);

Given('I am on the US Bank homepage', async function () {
  await this.page.goto('https://www.usbank.com');
});

Then('the header should be visible', async function () {
  await expect(
    this.page.locator(usbankLocators.header.selectors[0])
  ).toBeVisible();
});

Then('the footer should be visible', async function () {
  await expect(
    this.page.locator(usbankLocators.footer.selectors[0])
  ).toBeVisible();
});
