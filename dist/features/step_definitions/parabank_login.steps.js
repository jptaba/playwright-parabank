"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const test_1 = require("@playwright/test");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
// Use only __dirname for CommonJS compatibility
const locators = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../../utils/locators.json'), 'utf-8'));
(0, cucumber_1.Given)('I am on the Parabank login page', { timeout: 30 * 1000 }, async function () {
    await this.openBrowser();
    await this.page.goto('https://parabank.parasoft.com/parabank/index.htm');
});
(0, cucumber_1.When)('I log in with valid credentials', { timeout: 30 * 1000 }, async function () {
    await this.page.fill(locators.usernameInput.selectors[0], process.env.PARABANK_USER || '');
    await this.page.fill(locators.passwordInput.selectors[0], process.env.PARABANK_PASS || '');
    await this.page.click(locators.loginButton.selectors[0]);
});
(0, cucumber_1.Then)('I should see the account overview page', { timeout: 30 * 1000 }, async function () {
    await (0, test_1.expect)(this.page).toHaveURL(/overview/);
    await (0, test_1.expect)(this.page.locator(locators.accountOverviewHeader.selectors[0])).toContainText('Accounts Overview');
});
(0, cucumber_1.Then)('I log out', { timeout: 30 * 1000 }, async function () {
    await this.page.click(locators.logoutLink.selectors[0]);
    await (0, test_1.expect)(this.page).toHaveURL(/index.htm/);
    await this.closeBrowser();
});
