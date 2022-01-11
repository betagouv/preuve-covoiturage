import { FormControl } from '@angular/forms';

import { Bank } from '~/core/entities/shared/bank';

import { bicValidator } from '../validators/bic.validator';
import { ibanValidator } from '../validators/iban.validator';

export class FormBank {
  bank_name = new FormControl(); // tslint:disable-line variable-name
  client_name = new FormControl(); // tslint:disable-line variable-name
  iban = new FormControl();
  bic = new FormControl();

  constructor(bank: Bank) {
    this.bank_name.setValue(bank.bank_name);

    this.client_name.setValue(bank.client_name);

    this.iban.setValue(bank.iban);
    this.iban.setValidators([ibanValidator]);

    this.bic.setValue(bank.bic);
    this.bic.setValidators([bicValidator]);
  }
}
