import { When } from 'cypress-cucumber-preprocessor/steps';
import '../../support/parameters/formSelectorName';

When(`je remplis {formSelectorName} avec les données suivantes :`, function (formSelectorMap, dataTable) {
  const data = dataTable.rawTable.map(([fieldName, fieldValue]) => {
    if (!formSelectorMap.has(fieldName)) {
      throw new Error(`Cant find element named ${fieldName}`);
    }
    return [formSelectorMap.get(fieldName), fieldValue];
  });

  for (const [inputDefinition, value] of data) {
    const { selector: inputSelector, type: inputType } = inputDefinition;
    switch (inputType) {
      case 'input':
        cy.get(inputSelector).type(value).should('have.value', value);
        break;
      case 'select':
        cy.get(inputSelector).select(value);
        break;
      case 'mat-radio':
        cy.get(inputSelector).get('mat-radio-button .mat-radio-label-content').contains(value).click();
        break;
      case 'mat-select':
        cy.get(inputSelector).focus().click('right');
        cy.get('mat-option .mat-option-text').contains(value).click();
        break;
      case 'mat-autocomplete':
        // wait for element to be enabled (list data is loaded) before click and type value
        cy.get(inputSelector).get('input[type=text]').should('have.prop', 'disabled', false).click('right').type(value);
        cy.wait(1000); // arbitrary list process time
        cy.get('.mat-autocomplete-panel mat-option .mat-option-text').contains(value).click();
        break;
    }
  }

  // cy.get(elementsSelectors.get(elementName)).submit();
});
