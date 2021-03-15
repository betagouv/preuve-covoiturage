import { defineParameterType } from 'cypress-cucumber-preprocessor/steps';
import { elementsSelectors, getElementSelectorFromName } from '../helpers/getElementSelectorFromName';

defineParameterType({
  name: 'elementSelectorName',
  regexp: new RegExp(Array.from(elementsSelectors.keys()).join('|')),
  transformer: (name) => getElementSelectorFromName(name),
});
