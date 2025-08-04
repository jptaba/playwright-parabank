const { chromium } = require('playwright');
const { scanAndHealLocators } = require('./utils/locatorHealingUtils');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');

  // Replace with your actual JSON file path
  await scanAndHealLocators(page, './utils/locators.json');

  await browser.close();
})();
