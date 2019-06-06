import { Container } from '@pdc/core';
import { AjvValidatorProvider, ValidatorProviderInterface } from '@ilos/provider-validator';

import { phoneCustomKeyword } from './keywords/phoneCustomKeyword';

@Container.provider()
export class ValidatorProvider extends AjvValidatorProvider implements ValidatorProviderInterface {
  boot() {
    super.boot();

    this.registerCustomKeyword(phoneCustomKeyword);
  }
}
