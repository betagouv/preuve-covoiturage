import { Then } from 'cypress-cucumber-preprocessor/steps';
import '../../support/parameters/elementSelectorName';

Then(`je ne vois pas {elementSelectorName}`, function (elementSelector) {
  cy.get(elementSelector).should('not.be.visible');
});
