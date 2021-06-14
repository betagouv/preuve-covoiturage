import { Then } from 'cypress-cucumber-preprocessor/steps';
import { getElementSelectorFromName } from '../../support/helpers/getElementSelectorFromName';

/**
 * Failed with 'be.visible' assertion because of this bug:
 * https://github.com/cypress-io/cypress/issues/4395
 */
//
Then(`je vois la section {string}`, function (title) {
  cy.contains(getElementSelectorFromName('la section'), title).should('exist');
});
