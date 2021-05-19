import { Given } from 'cypress-cucumber-preprocessor/steps';

Given(`je suis sur la page {string}`, function (url: string) {
  cy.visit(url);
});
