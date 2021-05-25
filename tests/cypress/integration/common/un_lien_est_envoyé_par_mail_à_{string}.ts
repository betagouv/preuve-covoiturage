import { Then } from 'cypress-cucumber-preprocessor/steps';
import { mailClear, Email, mailInbox } from '../../support/helpers/mailhog';

Then(`un lien est envoyé par mail à {string}`, function (email) {
  cy.log(`try to fetch mail from ${email}`);
  cy.wrap(mailInbox(email), { timeout: 30000 })
    .then((emails: Email[]) => {
      expect(emails.length).to.be.greaterThan(0);
    })
    .then(() => {
      mailClear();
    });
});
