import { And } from 'cypress-cucumber-preprocessor/steps';
import '../../support/parameters/elementSelectorName';

And(`je vois que {elementSelectorName} n'inclut pas {string}`, function (elementSelector, elementAssertion) {
  cy.log(`try to find ${elementSelector}`);
  cy.get(elementSelector, { timeout: 10000 }).should('not.contain', elementAssertion);
});
