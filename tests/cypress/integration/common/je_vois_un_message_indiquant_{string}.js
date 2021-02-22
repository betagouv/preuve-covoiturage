const { Then } = require('cypress-cucumber-preprocessor/steps');

Then(`je vois un message indiquant {string}`, (messageText) => {
  cy.contains(messageText).should('be.visible');
});
