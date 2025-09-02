import { Given, When, Then, After } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { resolvePage } from '../../utils/bdd/universalResolver';
import path from 'path';
import { healAndSave } from '../../utils/locatorHealingUtils';

const pagesDir = path.resolve(__dirname, '../../utils/bdd/pageObjects');

Given(
  'I open the {word} page',
  { timeout: 60 * 1000 },
  async function (pageName: string) {
    // ensure browser/page are available on the world
    if (typeof this.openBrowser === 'function') {
      await this.openBrowser();
    }
    const pageJsonPath = path.resolve(pagesDir, `${pageName}.page.json`);
    const pageDef = resolvePage(pageJsonPath);
    await this.page.goto(pageDef.url);
    this._lastPageDef = pageDef; // stash for later steps
    this._lastPageJsonPath = pageJsonPath; // store path for healing writes
  }
);

async function findAndAct(
  ctx: any,
  elem: string,
  action: 'fill' | 'click' | 'check',
  value?: string
) {
  const element = (ctx._lastPageDef.elements as any)[elem];
  if (!element) throw new Error('Element not defined in page JSON: ' + elem);
  for (const sel of element.selectors || []) {
    const locator = ctx.page.locator(sel);
    if (await locator.count()) {
      if (action === 'fill') return locator.fill(value || '');
      if (action === 'click') return locator.click();
      if (action === 'check') return expect(locator).toBeVisible();
    }
  }
  // if not found, attempt healing
  const healed = await healAndSave(ctx.page, elem, ctx._lastPageJsonPath);
  if (healed) {
    const locator = ctx.page.locator(healed);
    if (action === 'fill') return locator.fill(value || '');
    if (action === 'click') return locator.click();
    if (action === 'check') return expect(locator).toBeVisible();
  }
  throw new Error('Element not found: ' + elem);
}

When(
  /I fill the "(.*)" with "(.*)"/,
  async function (elem: string, value: string) {
    await findAndAct(this, elem, 'fill', value);
  }
);

When(/I click the "(.*)"/, async function (elem: string) {
  await findAndAct(this, elem, 'click');
});

Then(/I should see the "(.*)"/, async function (elem: string) {
  // small wait for dynamic content
  await this.page.waitForTimeout(500);
  await findAndAct(this, elem, 'check');
});

After(async function () {
  if (typeof this.closeBrowser === 'function') {
    await this.closeBrowser();
  }
});
