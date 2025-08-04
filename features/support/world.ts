import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { chromium, Browser, Page, LaunchOptions } from 'playwright';

export class CustomWorld extends World {
  browser: Browser | undefined;
  page: Page | undefined;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async openBrowser() {
    const launchOptions: LaunchOptions = { headless: false };
    this.browser = await chromium.launch(launchOptions);
    this.page = await this.browser.newPage();
  }

  async closeBrowser() {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }
}

setWorldConstructor(CustomWorld);
