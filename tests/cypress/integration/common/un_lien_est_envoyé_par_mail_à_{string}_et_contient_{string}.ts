import { Then } from 'cypress-cucumber-preprocessor/steps';
import { mailContains, mailClear, Email } from '../../support/emails/mailhog';

Then(`un lien est envoyé par mail à {string} et contient {string}`, function (email: string, query: string) {
  cy.log(`try to fetch mail from ${email}`);
  cy.wrap(mailContains(query, email), { timeout: 30000 })
    .then((emails: Email[]) => {
      expect(emails.length).to.be.greaterThan(0);
    })
    .then(() => {
      mailClear();
    });
});
