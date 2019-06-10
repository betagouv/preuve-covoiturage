import { Container } from '@pdc/core';
import { AjvValidatorProvider, ValidatorProviderInterface } from '@ilos/provider-validator';

import { phoneCustomFormat } from './keywords/phoneCustomFormat';

@Container.provider()
export class ValidatorProvider extends AjvValidatorProvider implements ValidatorProviderInterface {
  boot() {
    super.boot();

    this.registerCustomKeyword(phoneCustomFormat);
  }
}
