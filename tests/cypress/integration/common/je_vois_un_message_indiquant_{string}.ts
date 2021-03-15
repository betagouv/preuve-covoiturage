import { Then } from 'cypress-cucumber-preprocessor/steps';

Then(`je vois un message indiquant {string}`, function (messageText) {
  cy.contains(messageText).should('be.visible');
});
