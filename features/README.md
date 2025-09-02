This folder contains Gherkin `.feature` files.

To regenerate Playwright Test specs from the features run:

```bash
npm run gen:playwright
```

Generated tests are placed in `tests/generated/` and can be executed with Playwright Test:

```bash
npm run test:playwright
# or headed
npm run test:playwright:headed
```

Notes:

- The generator maps a small subset of steps (open/fill/click/should see) used by this project.
- Review generated specs before committing; the generator uses simple heuristics to pick selectors from page JSONs.
