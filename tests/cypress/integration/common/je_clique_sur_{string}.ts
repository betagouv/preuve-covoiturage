import { When } from 'cypress-cucumber-preprocessor/steps';
import '../../support/parameters/elementSelectorName';

When(`je clique sur {elementSelectorName}`, function (elementSelector) {
  cy.log(`try to find ${elementSelector}`);
  cy.get(elementSelector).click();
});
