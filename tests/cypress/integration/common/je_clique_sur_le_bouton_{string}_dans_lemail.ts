import { When } from 'cypress-cucumber-preprocessor/steps';
import { extractLinkFromEmail } from '../../support/emails/helpers/extractLinkFromEmail';
import { mailContains, mailClear, Email } from '../../support/emails/mailhog';

When(`je clique sur le bouton {string} dans l'email {string}`, function (label: string, email: string) {
  cy.log(`try to fetch mail from ${email}`);
  cy.wrap(mailContains(label, email), { timeout: 30000 })
    .then((emails: Email[]) => {
      expect(emails.length).to.be.greaterThan(0);
      const body = emails[0].Content?.Body || '';
      const url = extractLinkFromEmail(Cypress.config('baseUrl'), body);
      expect(url).to.contain(Cypress.config('baseUrl'));
      cy.visit(url);
    })
    .then(() => {
      mailClear();
    });
});
