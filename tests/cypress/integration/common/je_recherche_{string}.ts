import { When } from 'cypress-cucumber-preprocessor/steps';

When(`je recherche {string}`, function (query: string) {
  cy.get('[data-test="field-search"]').type(query);
});
