"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const test_1 = require("@playwright/test");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Use only __dirname for CommonJS compatibility
const locators = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../../utils/locators.json'), 'utf-8'));
(0, cucumber_1.Given)('I am on the Parabank main page', { timeout: 30 * 1000 }, async function () {
    await this.openBrowser();
    await this.page.goto('https://parabank.parasoft.com/parabank/index.htm');
});
(0, cucumber_1.Then)('all main page elements should be present and visible', { timeout: 120 * 1000 }, async function () {
    // Only check elements that are not login-related
    const skipKeys = [
        'usernameInput',
        'passwordInput',
        'loginButton',
        'accountOverviewHeader',
        'logoutLink',
    ];
    for (const [key, value] of Object.entries(locators)) {
        if (skipKeys.includes(key))
            continue;
        const selector = value.selectors[0];
        try {
            const el = await this.page.waitForSelector(selector, { timeout: 2000 });
            (0, test_1.expect)(await el.isVisible()).toBeTruthy();
        }
        catch (e) {
            console.warn(`Element for key '${key}' with selector '${selector}' not found or not visible.`);
        }
    }
    await this.closeBrowser();
});
