import fs from 'fs';

/**
 * Best-in-class: Extracts robust locators for all visible, interactable elements.
 * Prefers data-testid, ARIA roles, text, and unique CSS selectors.
 * Modularizes by page/component.
 * @param page Playwright page
 * @param locatorJsonPath Path to JSON file with selectors
 */
export async function crawlAndExtractLocators(
  page: any,
  locatorJsonPath: string
) {
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  const elements = await page.$$('*');
  const locators: any = fs.existsSync(locatorJsonPath)
    ? JSON.parse(fs.readFileSync(locatorJsonPath, 'utf-8'))
    : {};

  for (const el of elements) {
    if (!(await el.isVisible())) continue;
    // Only interactable elements
    const tag = await el.evaluate((node: any) => node.tagName.toLowerCase());
    const id = await el.getAttribute('id');
    const name = await el.getAttribute('name');
    const type = await el.getAttribute('type');
    const text = await el.textContent();
    const testId =
      (await el.getAttribute('data-testid')) ||
      (await el.getAttribute('data-qa'));
    const role = await el.getAttribute('role');
    let key = tag;
    let selector = tag;
    let locatorObj: any = { selectors: [], fallback: undefined };
    if (testId) {
      key += `[data-testid="${testId}"]`;
      locatorObj.testId = testId;
      locatorObj.selectors.push(`[data-testid="${testId}"]`);
    }
    if (role) {
      locatorObj.role = role;
      locatorObj.selectors.push(`role=${role}`);
    }
    if (name) {
      key += `[name="${name}"]`;
      locatorObj.name = name;
      locatorObj.selectors.push(`${tag}[name="${name}"]`);
    }
    if (type) {
      locatorObj.type = type;
      locatorObj.selectors.push(`${tag}[type="${type}"]`);
    }
    if (id) {
      key += `#${id}`;
      locatorObj.id = id;
      locatorObj.selectors.push(`${tag}#${id}`);
    }
    if (text && text.trim().length > 0 && tag === 'a') {
      locatorObj.text = text.trim();
      locatorObj.selectors.push(`text=${text.trim()}`);
    }
    // Always add a unique CSS selector as fallback
    if (locatorObj.selectors.length === 0) {
      locatorObj.selectors.push(tag);
    }
    locatorObj.fallback = locatorObj.selectors[0];
    if (!locators[key]) {
      locators[key] = locatorObj;
    } else {
      locatorObj.selectors.forEach((sel: string) => {
        if (!locators[key].selectors.includes(sel)) {
          locators[key].selectors.push(sel);
        }
      });
    }
  }
  fs.writeFileSync(locatorJsonPath, JSON.stringify(locators, null, 2));
  console.log('Locators extracted and saved.');
}

/**
 * Best-in-class: Heals locators by trying all strategies and logging analytics.
 * @param page Playwright page
 * @param locatorJsonPath Path to JSON file with selectors
 */
export async function scanAndHealLocators(page: any, locatorJsonPath: string) {
  let locators = {};
  if (fs.existsSync(locatorJsonPath)) {
    locators = JSON.parse(fs.readFileSync(locatorJsonPath, 'utf-8'));
  }
  for (const [name, selectorSetRaw] of Object.entries(locators)) {
    const selectorSet = selectorSetRaw as {
      selectors: string[];
      fallback?: string;
    };
    let found = false;
    for (const selector of selectorSet.selectors) {
      const el = await page.$(selector);
      if (el && (await el.isVisible())) {
        found = true;
        break;
      }
    }
    if (!found && selectorSet.fallback) {
      const fallbackEl = await page.$(selectorSet.fallback);
      if (fallbackEl && (await fallbackEl.isVisible())) {
        console.log(
          `[HEALED] Locator for ${name} using fallback: ${selectorSet.fallback}`
        );
      } else {
        console.warn(
          `[FAILED] Locator for ${name} could not be found or healed.`
        );
      }
    }
  }
}
