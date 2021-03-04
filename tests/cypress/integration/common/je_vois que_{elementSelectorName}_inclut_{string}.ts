import { Then } from 'cypress-cucumber-preprocessor/steps';
import '../../support/parameters/elementSelectorName';

Then(`je vois que {elementSelectorName} inclut {string}`, function (elementSelector, elementAssertion) {
  cy.log(`try to find ${elementSelector}`);
  cy.contains(elementSelector, elementAssertion, { timeout: 10000 });
});
