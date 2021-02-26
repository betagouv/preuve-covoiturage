import { When } from 'cypress-cucumber-preprocessor/steps';
import { elementsSelectors } from '../../support/elementsSelectors';

// No arrow
When(`je clique sur {string}`, function (elementName) {
  if (!elementsSelectors.has(elementName)) {
    throw new Error(`Cant find element named ${elementName}`);
  }
  cy.log(`try to find ${elementName} with ${elementsSelectors.get(elementName)}`);
  cy.get(elementsSelectors.get(elementName)).click();
});

// import { defineParameterType } from 'cucumber';
// defineParameterType({
//     name: 'color',
//     regexp: /red|blue|yellow/,
//     transformer: s => new Color(s)
// })
