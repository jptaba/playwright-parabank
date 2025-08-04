const { chromium } = require('playwright');
const { crawlAndExtractLocators } = require('./utils/locatorHealingUtils');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await crawlAndExtractLocators(page, './utils/locators.json');
  await browser.close();
})();
