import { Then } from 'cypress-cucumber-preprocessor/steps';
import { getElementSelectorFromName } from '../../support/helpers/getElementSelectorFromName';

Then(`je vois le titre {string}`, function (title) {
  cy.contains(getElementSelectorFromName('le titre'), title).should('be.visible');
});
