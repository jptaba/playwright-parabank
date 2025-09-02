import { test } from '../../utils/bdd/playwrightAdapter';

test('Successful login with valid credentials', async ({ open, fill, click, shouldSee, fillElement, clickElement, shouldSeeElement }) => {
    await open("https://parabank.parasoft.com/parabank/index.htm");
    await fillElement("login", "username", "john");
    await fillElement("login", "password", "demo");
    await clickElement("login", "submit");
    await shouldSeeElement("login", "overviewHeader");
});

