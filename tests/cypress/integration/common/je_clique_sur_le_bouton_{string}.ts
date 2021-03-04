import { When } from 'cypress-cucumber-preprocessor/steps';

When(`je clique sur le bouton {string}`, function (message) {
  cy.log(`try to find button that contains ${message}`);
  cy.contains('button', message).click();
});
