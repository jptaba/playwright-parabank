# Playwright MasterClass E2E Framework

## Overview

This project is a modern, modular, and robust Playwright-based E2E automation framework for the Parabank demo application. It supports BDD with Cucumber, advanced locator management, self-healing, accessibility testing, Allure reporting, and more.

---

## Project Structure

```
Playwright MasterClass/
│
├── .env                        # Environment variables (credentials, config)
├── package.json                # Project dependencies and scripts
├── playwright.config.ts        # Playwright test runner configuration
├── tsconfig.json               # TypeScript configuration
│
├── features/                   # Cucumber feature files (BDD scenarios)
│   ├── parabank_login.feature
│   ├── parabank_mainpage_elements.feature
│   └── ...
│
├── features/step_definitions/  # Step definitions for Cucumber features
│   ├── parabank_login.steps.ts
│   ├── parabank_mainpage_elements.steps.ts
│   └── ...
│
├── tests/                      # Playwright native test files
│   ├── login.spec.ts
│   ├── a11y-login.spec.ts
│   └── ...
│
├── utils/                      # Utilities and helpers
│   ├── locatorHealingUtils.ts  # Self-healing locator logic
│   ├── frameworkUtils.ts       # Browser/device/session helpers
│   └── locators/               # Modularized locator files (JSON)
│       ├── login.json
│       ├── mainpage.json
│       ├── footer.json
│       ├── rightpanel.json
│       └── README.md           # Locator conventions and usage
│
├── runCrawlAndExtractLocators.js/ts # Page crawling and locator extraction scripts
├── runLocatorHealing.js/ts          # Locator healing runner
│
├── allure-report/               # Allure HTML report output
├── allure-results/              # Allure raw results
├── test-results/                # Playwright test artifacts (screenshots, videos)
└── ...
```

---

## Folder/Section Descriptions

- **features/**: Gherkin `.feature` files describing BDD scenarios for Parabank.
- **features/step_definitions/**: Step definitions implementing feature steps using Playwright and modular locators.
- **tests/**: Playwright native test files (TypeScript). Use for direct Playwright test runner usage.
- **utils/**: Utility scripts and helpers for browser/device config, locator healing, and more.
  - **utils/locators/**: Modularized locator files, one per page/component, using best-practice selectors.
- **runCrawlAndExtractLocators.js/ts**: Script to crawl pages and extract visible/interactable elements, preferring stable selectors (`data-testid`, ARIA, text, unique CSS). Outputs modular locator JSON files.
- **runLocatorHealing.js/ts**: Script to run locator healing, updating selectors in modular locator files and logging analytics.
- **allure-report/**: Generated Allure HTML reports (open `index.html` after test runs).
- **allure-results/**: Raw Allure results for reporting.
- **test-results/**: Playwright test artifacts (screenshots, videos, error context).

---

## Locator Management, Crawling, and Healing

### Modularized Locators

- All selectors are organized by page/component in `utils/locators/*.json`.
- Each locator entry includes:
  - `selectors`: Array of preferred selectors (testId, ARIA, text, CSS)
  - `testId`, `role`, `text`, `fallback`: For Playwright's recommended queries and self-healing
- See `utils/locators/README.md` for conventions.

### Page Crawling & Extraction

- Use `runCrawlAndExtractLocators.js` to crawl a page and extract all visible/interactable elements.
- The script prefers stable selectors and outputs/updates the relevant JSON file in `utils/locators/`.
- Run with:
  ```
  npx ts-node runCrawlAndExtractLocators.ts --url <PAGE_URL> --output utils/locators/<page>.json
  ```

### Locator Healing

- Use `runLocatorHealing.js` to automatically update broken selectors in locator files.
- The script attempts alternative selectors and logs analytics for healing attempts.
- Run with:
  ```
  npx ts-node runLocatorHealing.ts --page <page>
  ```

---

## Creating a New Test Case

1. **For Cucumber (BDD):**

   - Add a new `.feature` file in `features/` describing your scenario.
   - Add or update step definitions in `features/step_definitions/`, using modularized locators and Playwright's recommended queries.
   - Run with:
     ```
     npx cucumber-js features/<your_feature>.feature --require features/step_definitions/<your_steps>.ts
     ```

2. **For Playwright Native:**

   - Add a new `.spec.ts` file in `tests/`.
   - Use Playwright's `test` and `expect` APIs, and import locators/utilities as needed.
   - Run with:
     ```
     npx playwright test tests/<your_test>.spec.ts
     ```

3. **If new elements are needed:**
   - Run the crawling script to extract new locators, or manually add to the relevant `utils/locators/*.json` file.
   - If selectors break, run the healing script to update them.

---

## Accessibility & Reporting

- Accessibility tests: See `a11y-login.spec.ts` and use `@axe-core/playwright` via `runA11yTest`.
- Allure reports: After running tests, open the HTML report:
  ```
  npx playwright show-report
  # or open allure-report/index.html
  ```

---

## Best Practices

- Always use modularized locators and Playwright's recommended queries (`getByTestId`, `getByRole`, `getByText`).
- Prefer stable selectors (`data-testid`, ARIA, text) for all new locators.
- Use crawling and healing scripts to automate locator management and reduce maintenance.
- Keep credentials and secrets in `.env` (never commit real secrets).

---

For more details, see inline comments in each file and the `utils/locators/README.md` for locator conventions.
