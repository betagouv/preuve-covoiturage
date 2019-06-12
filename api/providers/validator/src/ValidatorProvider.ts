import { Container } from '@ilos/core';
import { AjvValidatorProvider, ValidatorProviderInterface } from '@ilos/provider-validator';

import { bicCustomFormat } from './formats/bicCustomFormat';
import { dateCustomFormat } from './formats/dateCustomFormat';
import { emailCustomFormat } from './formats/emailCustomFormat';
import { euVatCustomFormat } from './formats/euVatCustomFormat';
import { ibanCustomFormat } from './formats/ibanCustomFormat';
import { inseeCustomFormat } from './formats/inseeCustomFormat';
import { latCustomFormat } from './formats/latCustomFormat';
import { lonCustomFormat } from './formats/lonCustomFormat';
import { nafCustomFormat } from './formats/nafCustomFormat';
import { nicCustomFormat } from './formats/nicCustomFormat';
import { phoneCustomFormat } from './formats/phoneCustomFormat';
import { postcodeCustomFormat } from './formats/postcodeCustomFormat';
import { sirenCustomFormat } from './formats/sirenCustomFormat';
import { siretCustomFormat } from './formats/siretCustomFormat';

@Container.provider()
export class ValidatorProvider extends AjvValidatorProvider implements ValidatorProviderInterface {
  boot() {
    super.boot();

    this.addFormat('bic', bicCustomFormat);
    this.addFormat('date', dateCustomFormat);
    this.addFormat('email', emailCustomFormat);
    this.addFormat('euvat', euVatCustomFormat);
    this.addFormat('iban', ibanCustomFormat);
    this.addFormat('insee', inseeCustomFormat);
    this.addFormat('lat', latCustomFormat);
    this.addFormat('lon', lonCustomFormat);
    this.addFormat('naf', nafCustomFormat);
    this.addFormat('nic', nicCustomFormat);
    this.addFormat('phone', phoneCustomFormat);
    this.addFormat('postcode', postcodeCustomFormat);
    this.addFormat('siren', sirenCustomFormat);
    this.addFormat('siret', siretCustomFormat);
  }
}
