const fs = require('fs');
const path = require('path');

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

/**
 * Attempt to discover a working selector for an element name and persist it to a page JSON.
 * Kept intentionally lightweight and synchronous-file I/O for simplicity in test runs.
 * @param {import('playwright').Page} page
 * @param {string} elemName
 * @param {string} pageJsonPath
 */
async function healAndSave(page, elemName, pageJsonPath) {
  try {
    if (!pageJsonPath || !fs.existsSync(pageJsonPath)) return null;
    const pageJson = JSON.parse(fs.readFileSync(pageJsonPath, 'utf-8'));
    pageJson.elements = pageJson.elements || {};
    pageJson.elements[elemName] = pageJson.elements[elemName] || {};
    pageJson.elements[elemName].selectors =
      pageJson.elements[elemName].selectors || [];

    const candidates = [];
    candidates.push(`input[name="${elemName}"]`);
    candidates.push(`input[id="${elemName}"]`);
    candidates.push(`#${elemName}`);
    candidates.push(`[name="${elemName}"]`);
    candidates.push(`[placeholder*="${elemName}"]`);
    candidates.push(`label:has-text("${elemName}")`);
    candidates.push(`text=${elemName}`);
    if (/user|email/i.test(elemName)) {
      candidates.push("input[name*='user']", "input[name*='email']");
    }
    if (/pass/i.test(elemName)) candidates.push("input[name*='pass']");

    const uniq = Array.from(new Set(candidates));
    for (const cand of uniq) {
      try {
        const loc = page.locator(cand);
        if (await loc.count()) {
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

    // fallback: scan inputs/buttons
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

module.exports = { scanAndHealLocators, crawlAndExtractLocators, healAndSave };
