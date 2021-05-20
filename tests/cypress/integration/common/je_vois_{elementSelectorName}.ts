import { Then } from 'cypress-cucumber-preprocessor/steps';
import '../../support/parameters/elementSelectorName';

Then(`je vois {elementSelectorName}`, function (elementSelector) {
  cy.get(elementSelector).should('be.visible');
});
