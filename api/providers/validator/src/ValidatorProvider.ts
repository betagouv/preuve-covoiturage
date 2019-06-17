import { Container } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { AjvValidatorProvider, ValidatorProviderInterface } from '@ilos/provider-validator';

import { bicCustomFormat } from './formats/bicCustomFormat';
import { euVatCustomFormat } from './formats/euVatCustomFormat';
import { ibanCustomFormat } from './formats/ibanCustomFormat';
import { inseeCustomFormat } from './formats/inseeCustomFormat';
import { latCustomFormat } from './keywords/latKeyword';
import { lonCustomFormat } from './keywords/lonKeyword';
import { nafCustomFormat } from './formats/nafCustomFormat';
import { nicCustomFormat } from './formats/nicCustomFormat';
import { objectidCustomFormat } from './formats/objectidCustomFormat';
import { phoneCustomFormat } from './formats/phoneCustomFormat';
import { postcodeCustomFormat } from './formats/postcodeCustomFormat';
import { sirenCustomFormat } from './formats/sirenCustomFormat';
import { siretCustomFormat } from './formats/siretCustomFormat';

@Container.provider()
export class ValidatorProvider extends AjvValidatorProvider implements ValidatorProviderInterface {
  constructor(config: ConfigProviderInterfaceResolver) {
    super(config);
  }

  boot() {
    super.boot();

    // register string formats
    this.registerCustomKeyword({ name: 'bic', type: 'format', definition: bicCustomFormat });
    this.registerCustomKeyword({ name: 'euvat', type: 'format', definition: euVatCustomFormat });
    this.registerCustomKeyword({ name: 'iban', type: 'format', definition: ibanCustomFormat });
    this.registerCustomKeyword({ name: 'insee', type: 'format', definition: inseeCustomFormat });
    this.registerCustomKeyword({ name: 'lat', type: 'format', definition: latCustomFormat });
    this.registerCustomKeyword({ name: 'lon', type: 'format', definition: lonCustomFormat });
    this.registerCustomKeyword({ name: 'naf', type: 'format', definition: nafCustomFormat });
    this.registerCustomKeyword({ name: 'nic', type: 'format', definition: nicCustomFormat });
    this.registerCustomKeyword({ name: 'objectid', type: 'format', definition: objectidCustomFormat });
    this.registerCustomKeyword({ name: 'phone', type: 'format', definition: phoneCustomFormat });
    this.registerCustomKeyword({ name: 'postcode', type: 'format', definition: postcodeCustomFormat });
    this.registerCustomKeyword({ name: 'siren', type: 'format', definition: sirenCustomFormat });
    this.registerCustomKeyword({ name: 'siret', type: 'format', definition: siretCustomFormat });
  }
}
