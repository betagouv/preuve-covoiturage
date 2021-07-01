import { Then } from 'cypress-cucumber-preprocessor/steps';
import { mailEmptyInbox, mailClear, Email } from '../../support/emails/mailhog';

Then(`{string} n'a rien reçu`, function (email: string) {
  cy.wait(1000)
    .wrap(mailEmptyInbox(email), { timeout: 30000 })
    .then((emails: Email[]) => {
      expect(emails?.length).to.eq(0);
    })
    .then(() => {
      mailClear();
    });
});
