import fs from 'fs';
import path from 'path';

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

export async function healAndSave(
  page: any,
  elemName: string,
  pageJsonPath: string
) {
  try {
    if (!pageJsonPath || !fs.existsSync(pageJsonPath)) return null;
    const pageJson = JSON.parse(fs.readFileSync(pageJsonPath, 'utf-8'));
    pageJson.elements = pageJson.elements || {};
    pageJson.elements[elemName] = pageJson.elements[elemName] || {};
    pageJson.elements[elemName].selectors =
      pageJson.elements[elemName].selectors || [];

    const candidates: string[] = [];
    // common heuristics
    candidates.push(`input[name="${elemName}"]`);
    candidates.push(`input[id="${elemName}"]`);
    candidates.push(`#${elemName}`);
    candidates.push(`[name="${elemName}"]`);
    candidates.push(`[placeholder*="${elemName}"]`);
    candidates.push(`label:has-text("${elemName}")`);
    candidates.push(`text=${elemName}`);
    // semantic guesses
    if (/user|email/i.test(elemName))
      candidates.push("input[name*='user']", "input[name*='email']");
    if (/pass/i.test(elemName)) candidates.push("input[name*='pass']");

    // dedupe
    const uniq = Array.from(new Set(candidates));
    for (const cand of uniq) {
      try {
        const loc = page.locator(cand);
        if (await loc.count()) {
          // persist to top of selectors array
          if (!pageJson.elements[elemName].selectors.includes(cand)) {
            pageJson.elements[elemName].selectors.unshift(cand);
          }
          fs.writeFileSync(pageJsonPath, JSON.stringify(pageJson, null, 2));
          console.log(
            `[HEALED] ${elemName} -> ${cand} (saved to ${path.basename(
              pageJsonPath
            )})`
          );
          return cand;
        }
      } catch (e) {
        // ignore invalid selectors
      }
    }
    // fallback: attempt to find inputs/buttons and pick by type
    const inputs = await page.$$(`input, button, textarea, select, a`);
    for (const el of inputs) {
      try {
        if (!(await el.isVisible())) continue;
        const id = await el.getAttribute('id');
        const name = await el.getAttribute('name');
        const text = (await el.textContent()) || '';
        if (
          name &&
          /user|email|pass|login|submit|search/i.test(name + elemName)
        ) {
          const sel = name ? `input[name="${name}"]` : id ? `#${id}` : null;
          if (sel) {
            if (!pageJson.elements[elemName].selectors.includes(sel)) {
              pageJson.elements[elemName].selectors.unshift(sel);
            }
            fs.writeFileSync(pageJsonPath, JSON.stringify(pageJson, null, 2));
            console.log(`[HEALED] ${elemName} -> ${sel} (saved)`);
            return sel;
          }
        }
        if (
          text &&
          text.trim().length > 0 &&
          text.trim().toLowerCase().includes(elemName.toLowerCase())
        ) {
          const sel = `text=${text.trim()}`;
          if (!pageJson.elements[elemName].selectors.includes(sel)) {
            pageJson.elements[elemName].selectors.unshift(sel);
          }
          fs.writeFileSync(pageJsonPath, JSON.stringify(pageJson, null, 2));
          console.log(`[HEALED] ${elemName} -> ${sel} (saved)`);
          return sel;
        }
      } catch (e) {
        // ignore
      }
    }
    return null;
  } catch (err) {
    console.error('healAndSave error', err);
    return null;
  }
}
