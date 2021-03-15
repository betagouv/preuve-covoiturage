import { When } from 'cypress-cucumber-preprocessor/steps';
import '../../support/parameters/elementSelectorName';

When(
  `je clique sur {elementSelectorName} de la ligne incluant {string} de {elementSelectorName}`,
  function (elementSelector, elementAssertion, listSelector) {
    cy.log(`try to find ${listSelector}`);
    cy.contains(listSelector, elementAssertion).within(() => {
      cy.get(elementSelector).click();
    });
  },
);
