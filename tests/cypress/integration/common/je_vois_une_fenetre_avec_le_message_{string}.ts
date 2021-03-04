import { Then } from 'cypress-cucumber-preprocessor/steps';
import { getElementSelectorFromName } from '../../support/helpers/getElementSelectorFromName';

Then(`je vois une fenêtre avec le message {string}`, function (msg) {
  cy.contains(getElementSelectorFromName('une fenêtre'), msg).should('be.visible');
});
