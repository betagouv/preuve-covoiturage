import { When } from 'cypress-cucumber-preprocessor/steps';
import { formInputsSelectors, elementsSelectors } from '../../support/elementsSelectors';

When(`je remplis {string} avec les données suivantes :`, function (elementName, dataTable) {
  if (!elementsSelectors.has(elementName) || !formInputsSelectors.has(elementName)) {
    throw new Error(`Cant find element named ${elementName}`);
  }

  const currentFormInputsSelectors = formInputsSelectors.get(elementName);

  const data = dataTable.rawTable.map(([fieldName, fieldValue]) => {
    if (!currentFormInputsSelectors.has(fieldName)) {
      throw new Error(`Cant find element named ${fieldName} in ${elementName}`);
    }
    const formInputSelector = currentFormInputsSelectors.get(fieldName);
    return typeof formInputSelector === 'string'
      ? [{ selector: formInputSelector, type: 'input' }, fieldValue]
      : [formInputSelector, fieldValue];
  });

  for (const [input, value] of data) {
    const { selector: inputSelector, type: inputType } = input;
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
