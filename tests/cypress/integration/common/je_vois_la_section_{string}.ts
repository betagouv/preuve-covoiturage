import { Then } from 'cypress-cucumber-preprocessor/steps';
import { getElementSelectorFromName } from '../../support/helpers/getElementSelectorFromName';

Then(`je vois la section {string}`, function (title) {
  cy.contains(getElementSelectorFromName('la section'), title).should('be.visible');
});
