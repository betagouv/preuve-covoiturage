import { And } from 'cypress-cucumber-preprocessor/steps';
import { elementsSelectors } from '../../support/elementsSelectors';

And(`je vois que {string} inclut {string}`, function (elementName, elementAssertion) {
  if (!elementsSelectors.has(elementName)) {
    throw new Error(`Cant find element named ${elementName}`);
  }
  const selector = elementsSelectors.get(elementName);
  cy.log(`try to find ${elementName} with ${selector}`);
  cy.contains(selector, elementAssertion, { timeout: 10000 });
});
