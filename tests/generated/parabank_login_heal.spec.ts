import { test } from '../../utils/bdd/playwrightAdapter';

test('Healing when username selector is missing', async ({ open, fill, click, shouldSee, fillElement, clickElement, shouldSeeElement }) => {
    await open("https://parabank.parasoft.com/parabank/index.htm");
    await fillElement("login_heal", "usernameBroken", "john");
    await fillElement("login_heal", "password", "demo");
    await clickElement("login_heal", "submit");
    await shouldSeeElement("login_heal", "overviewHeader");
});

