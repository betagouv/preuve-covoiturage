import { Then } from 'cypress-cucumber-preprocessor/steps';
import { Email, extractLinkFromEmail, waitForEmail } from '../../support/helpers/waitForEmail';

Then(`un lien est envoyé par mail à {string}`, function (email) {
  cy.log(`try to fetch mail from ${email}`);
  cy.wrap(waitForEmail(email), { timeout: 30000 }).then((email) => {
    const link = extractLinkFromEmail(email as Email);
    expect(link).not.to.be.null;
  });
});
