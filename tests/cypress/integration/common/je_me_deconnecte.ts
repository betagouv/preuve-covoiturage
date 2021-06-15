import { Then } from 'cypress-cucumber-preprocessor/steps';

Then(`je me déconnecte`, function () {
  // click even if the element is not visible
  cy.get('[data-test="button-logout"]').click({ force: true });
});
