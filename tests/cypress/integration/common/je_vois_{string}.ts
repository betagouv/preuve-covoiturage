import { Then } from 'cypress-cucumber-preprocessor/steps';
import { elementsSelectors } from '../../support/elementsSelectors';

Then(`je vois {string}`, (elementName) => {
  if (!elementsSelectors.has(elementName)) {
    throw new Error(`Cant find element named ${elementName}`);
  }
  cy.log(`try to find ${elementName} with ${elementsSelectors.get(elementName)}`);
  cy.get(elementsSelectors.get(elementName)).should('be.visible');
});
