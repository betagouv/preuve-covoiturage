import { FormControl, Validators } from '@angular/forms';

import { Address } from '~/core/entities/shared/address';
import { REGEXP } from '~/core/const/validators.const';

export class FormAddress {
  street = new FormControl();
  postcode = new FormControl();
  cedex = new FormControl();
  city = new FormControl();
  country = new FormControl();

  constructor(address: Address) {
    this.street.setValue(address.street);

    this.postcode.setValue(address.postcode);
    this.postcode.setValidators([Validators.pattern(REGEXP.postcode)]);

    this.cedex.setValue(address.cedex);
    this.cedex.setValidators([Validators.pattern(REGEXP.cedex)]);

    this.city.setValue(address.city);

    this.country.setValue(address.country);
  }
}
