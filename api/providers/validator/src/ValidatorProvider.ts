import { Container } from '@pdc/core';
import { AjvValidatorProvider, ValidatorProviderInterface } from '@ilos/provider-validator';

@Container.provider()
export class ValidatorProvider extends AjvValidatorProvider implements ValidatorProviderInterface {
  boot() {
    // TODO
    // call super() and define customKeywords
  }
}
