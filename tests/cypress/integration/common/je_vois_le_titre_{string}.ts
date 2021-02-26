import { Then } from 'cypress-cucumber-preprocessor/steps';

Then(`je vois le titre {string}`, (title) => {
  cy.contains('.page-title', title).should('be.visible');
});
