import { Then } from 'cypress-cucumber-preprocessor/steps';
import { getElementSelectorFromName } from '../../support/helpers/getElementSelectorFromName';

Then(`je vois l'URL {string}`, function (url) {
  cy.location('pathname', { timeout: 3000 }).should('include', url);
});
