"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomWorld = void 0;
const cucumber_1 = require("@cucumber/cucumber");
const playwright_1 = require("playwright");
class CustomWorld extends cucumber_1.World {
    constructor(options) {
        super(options);
    }
    async openBrowser() {
        const launchOptions = { headless: false };
        this.browser = await playwright_1.chromium.launch(launchOptions);
        this.page = await this.browser.newPage();
    }
    async closeBrowser() {
        if (this.page)
            await this.page.close();
        if (this.browser)
            await this.browser.close();
    }
}
exports.CustomWorld = CustomWorld;
(0, cucumber_1.setWorldConstructor)(CustomWorld);
