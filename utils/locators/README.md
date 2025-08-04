# Locator Management Best Practices

## Overview

This project uses best-in-class locator management for Playwright/Cucumber E2E testing. Locators are modularized by page/component, prefer stable attributes, and support self-healing and analytics.

## Locator Structure

- **Location:** `utils/locators/<page>.json`
- **Format:**
  ```json
  {
    "elementKey": {
      "selectors": ["[data-testid='foo']", "text=Foo", "css=..."],
      "testId": "foo",
      "role": "button",
      "name": "foo",
      "type": "submit",
      "text": "Foo",
      "fallback": "[data-testid='foo']"
    },
    ...
  }
  ```
- **Selector Priority:**
  1. `data-testid`/`data-qa`
  2. ARIA `role`/`name`
  3. Visible text
  4. Unique CSS selector

## Extraction & Healing

- **Extraction:** Only visible, interactable elements are extracted. Prefers `data-testid`/`data-qa` and ARIA roles.
- **Healing:** Tries all selectors, logs analytics, and only considers visible elements.

## Usage in Step Definitions

- Use the helper:
  ```ts
  function getLocator(page, locatorObj) {
    if (locatorObj.testId) return page.getByTestId(locatorObj.testId);
    if (locatorObj.role) return page.getByRole(locatorObj.role);
    if (locatorObj.text) return page.getByText(locatorObj.text);
    return page.locator(locatorObj.selectors[0]);
  }
  ```
- Example:
  ```ts
  await getLocator(page, locators.loginButton).click();
  ```

## Maintenance

- Locators are versioned in Git.
- Extraction and healing scripts should be run after UI changes.
- Manual review is encouraged for business-critical flows.

## Recommendations

- Add `data-testid` to all business-critical elements in the app for maximum stability.
- Use Playwright’s recommended queries in all new tests.
- Review locator analytics to prioritize maintenance.
