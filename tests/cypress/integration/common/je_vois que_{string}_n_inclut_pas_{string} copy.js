const { And } = require('cypress-cucumber-preprocessor/steps');
const { elementsSelectors } = require('../../support/elementsSelectors.js');

And(`je vois que {string} n'inclut pas {string}`, (elementName, elementAssertion) => {
  if (!elementsSelectors.has(elementName)) {
    throw new Error(`Cant find element named ${elementName}`);
  }
  const selector = elementsSelectors.get(elementName);
  cy.log(`try to find ${elementName} with ${selector}`);
  cy.get(selector, { timeout: 10000 }).should('not.contain', elementAssertion);
});
