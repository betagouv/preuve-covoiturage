import { Then } from 'cypress-cucumber-preprocessor/steps';

Then(`je me déconnecte`, function () {
  cy.get('[data-test="button-logout"]').click();
});
