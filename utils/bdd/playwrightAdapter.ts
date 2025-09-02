import { test as base, expect, Page } from '@playwright/test';
import path from 'path';
import { resolvePage } from './universalResolver';
import { healAndSave } from '../../utils/locatorHealingUtils';

export type PlaywrightHelpers = {
  page: Page;
  open: (url: string) => Promise<void>;
  fill: (sel: string, value: string) => Promise<void>;
  click: (sel: string) => Promise<void>;
  shouldSee: (sel: string) => Promise<void>;
  fillElement: (pageName: string, elem: string, value: string) => Promise<void>;
  clickElement: (pageName: string, elem: string) => Promise<void>;
  shouldSeeElement: (pageName: string, elem: string) => Promise<void>;
};

export const test = base.extend<PlaywrightHelpers>({
  page: async ({ page }, use) => {
    await use(page);
  },
  open: async ({ page }, use) => {
    await use(async (url: string) => {
      await page.goto(url);
      return;
    });
  },
  fill: async ({ page }, use) => {
    await use(async (sel: string, value: string) => {
      await page.locator(sel).fill(value);
    });
  },
  click: async ({ page }, use) => {
    await use(async (sel: string) => page.locator(sel).click());
  },
  shouldSee: async ({ page }, use) => {
    await use(async (sel: string) => {
      await expect(page.locator(sel)).toBeVisible();
    });
  },
  // resolve by page name + element key using project page objects and registry
  fillElement: async (
    { page }: { page: Page },
    use: (
      fn: (pageName: string, elem: string, value: string) => Promise<void>
    ) => Promise<void>
  ) => {
    await use(async (pageName: string, elem: string, value: string) => {
      try {
        const pageJsonPath = path.resolve(
          process.cwd(),
          'utils',
          'bdd',
          'pageObjects',
          `${pageName}.page.json`
        );
        const pageDef = resolvePage(pageJsonPath);
        const element = (pageDef.elements as any)[elem];
        if (element) {
          for (const sel of element.selectors || []) {
            const loc = page.locator(sel);
            if (await loc.count()) {
              await loc.fill(value);
              return;
            }
          }
        }
        // try healing
        const healed = await healAndSave(page, elem, pageJsonPath);
        if (healed) return page.locator(healed).fill(value);
        throw new Error(`Element not found: ${elem}`);
      } catch (err) {
        throw err;
      }
    });
  },
  clickElement: async (
    { page }: { page: Page },
    use: (
      fn: (pageName: string, elem: string) => Promise<void>
    ) => Promise<void>
  ) => {
    await use(async (pageName: string, elem: string) => {
      const pageJsonPath = path.resolve(
        process.cwd(),
        'utils',
        'bdd',
        'pageObjects',
        `${pageName}.page.json`
      );
      const pageDef = resolvePage(pageJsonPath);
      const element = (pageDef.elements as any)[elem];
      if (element) {
        for (const sel of element.selectors || []) {
          const loc = page.locator(sel);
          if (await loc.count()) {
            await loc.click();
            await page.waitForLoadState('networkidle').catch(() => undefined);
            return;
          }
        }
      }
      const healed = await healAndSave(page, elem, pageJsonPath);
      if (healed) {
        await page.locator(healed).click();
        await page.waitForLoadState('networkidle').catch(() => undefined);
        return;
      }
      throw new Error(`Element not found: ${elem}`);
    });
  },

  shouldSeeElement: async (
    { page }: { page: Page },
    use: (
      fn: (pageName: string, elem: string) => Promise<void>
    ) => Promise<void>
  ) => {
    await use(async (pageName: string, elem: string) => {
      const pageJsonPath = path.resolve(
        process.cwd(),
        'utils',
        'bdd',
        'pageObjects',
        `${pageName}.page.json`
      );
      const pageDef = resolvePage(pageJsonPath);
      const element = (pageDef.elements as any)[elem];
      if (element) {
        for (const sel of element.selectors || []) {
          const loc = page.locator(sel);
          if (await loc.count())
            return loc.waitFor({ state: 'visible', timeout: 5000 });
        }
      }
      const healed = await healAndSave(page, elem, pageJsonPath);
      if (healed)
        return page
          .locator(healed)
          .waitFor({ state: 'visible', timeout: 5000 });
      throw new Error(`Element not found: ${elem}`);
    });
  },
});

export { expect };
