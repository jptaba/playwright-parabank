"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomBrowserProject = getRandomBrowserProject;
exports.getDeviceForBrowser = getDeviceForBrowser;
exports.getStorageStatePath = getStorageStatePath;
exports.getTestData = getTestData;
// This file contains utility functions for randomizing browser usage and handling storageState for authenticated sessions.
const test_1 = require("@playwright/test");
// Use string type for browser names instead of BrowserName type
function getRandomBrowserProject() {
    const browsers = ['chromium', 'firefox', 'webkit'];
    const randomIndex = Math.floor(Math.random() * browsers.length);
    return browsers[randomIndex];
}
function getDeviceForBrowser(browser) {
    switch (browser) {
        case 'chromium':
            return test_1.devices['Desktop Chrome'];
        case 'firefox':
            return test_1.devices['Desktop Firefox'];
        case 'webkit':
            return test_1.devices['Desktop Safari'];
        default:
            return test_1.devices['Desktop Chrome'];
    }
}
// Placeholder for loading storageState from a file (for authenticated sessions)
function getStorageStatePath() {
    return './auth/storageState.json';
}
// Placeholder for test data mockup
function getTestData() {
    return {
        username: 'testuser',
        password: 'testpass',
        // Add more fields as needed
    };
}
