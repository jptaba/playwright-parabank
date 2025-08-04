const fs = require('fs');

/**
 * Scan and heal locators using a JSON file.
 * @param {import('playwright').Page} page Playwright page
 * @param {string} locatorJsonPath Path to JSON file with selectors
 */
async function scanAndHealLocators(page, locatorJsonPath) {
  let locators = {};
  if (fs.existsSync(locatorJsonPath)) {
    locators = JSON.parse(fs.readFileSync(locatorJsonPath, 'utf-8'));
  }
  for (const [name, selectorSetRaw] of Object.entries(locators)) {
    const selectorSet = selectorSetRaw;
    let found = false;
    for (const selector of selectorSet.selectors) {
      if (await page.$(selector)) {
        found = true;
        break;
      }
    }
    if (!found && selectorSet.fallback) {
      if (await page.$(selectorSet.fallback)) {
        console.log(`Healed locator for ${name} using fallback.`);
      } else {
        console.warn(`Locator for ${name} could not be found or healed.`);
      }
    }
  }
}

/**
 * Crawl the main page and extract all elements with their selectors.
 * Adds them to the locators JSON file.
 * @param {import('playwright').Page} page Playwright page
 * @param {string} locatorJsonPath Path to JSON file with selectors
 */
async function crawlAndExtractLocators(page, locatorJsonPath) {
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  const elements = await page.$$('*');
  const locators = fs.existsSync(locatorJsonPath)
    ? JSON.parse(fs.readFileSync(locatorJsonPath, 'utf-8'))
    : {};

  for (const el of elements) {
    const tag = await el.evaluate((node) => node.tagName.toLowerCase());
    const id = await el.getAttribute('id');
    const name = await el.getAttribute('name');
    const type = await el.getAttribute('type');
    const text = await el.textContent();
    let key = tag;
    let selector = tag;
    if (id) {
      key += `#${id}`;
      selector += `#${id}`;
    } else if (name) {
      key += `[name="${name}"]`;
      selector += `[name="${name}"]`;
    } else if (type) {
      key += `[type="${type}"]`;
      selector += `[type="${type}"]`;
    } else if (text && text.trim().length > 0 && tag === 'a') {
      key += `[text="${text.trim()}"]`;
      selector = `text=${text.trim()}`;
    }
    if (!locators[key]) {
      locators[key] = { selectors: [selector] };
    } else if (!locators[key].selectors.includes(selector)) {
      locators[key].selectors.push(selector);
    }
  }
  fs.writeFileSync(locatorJsonPath, JSON.stringify(locators, null, 2));
  console.log('Locators extracted and saved.');
}

module.exports = { scanAndHealLocators, crawlAndExtractLocators };
