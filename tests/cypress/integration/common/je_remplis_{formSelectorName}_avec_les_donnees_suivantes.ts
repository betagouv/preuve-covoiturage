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
      case 'mat-select':
        cy.get(inputSelector).focus().click('right');
        cy.get('mat-option .mat-option-text').contains(value).click();
        break;
      case 'mat-autocomplete':
        cy.get(inputSelector).click('right').type(value.substring(0, 15));
        cy.get('mat-option .mat-option-text').contains(value).click();
        break;
    }
  }

  // cy.get(elementsSelectors.get(elementName)).submit();
});
