const { Then } = require('cypress-cucumber-preprocessor/steps');
const { elementsSelectors } = require('../../support/elementsSelectors.js');

Then(`je vois {string}`, (elementName) => {
  if (!elementsSelectors.has(elementName)) {
    throw new Error(`Cant find element named ${elementName}`);
  }
  cy.log(`try to find ${elementName} with ${elementsSelectors.get(elementName)}`);
  cy.get(elementsSelectors.get(elementName)).should('be.visible');
});
