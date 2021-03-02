import { When } from 'cypress-cucumber-preprocessor/steps';
import { elementsSelectors } from '../../support/elementsSelectors';

When(`je clique sur {string}`, function (elementName) {
  if (!elementsSelectors.has(elementName)) {
    throw new Error(`Cant find element named ${elementName}`);
  }
  cy.log(`try to find ${elementName} with ${elementsSelectors.get(elementName)}`);
  cy.get(elementsSelectors.get(elementName)).click();
});
