import { defineParameterType } from 'cypress-cucumber-preprocessor/steps';
import { formSelectors, getFormSelectorsFromName } from '../helpers/getFormSelectorsFromName';

defineParameterType({
  name: 'formSelectorName',
  regexp: new RegExp(Array.from(formSelectors.keys()).join('|')),
  transformer: (name) => getFormSelectorsFromName(name),
});
