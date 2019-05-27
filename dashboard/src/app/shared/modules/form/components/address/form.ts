import { FormControl, Validators } from '@angular/forms';

import { Address } from '~/entities/database/address';
import { regexp } from '~/entities/validators';

export class AddressForm {
  street = new FormControl();
  postcode = new FormControl();
  cedex = new FormControl();
  city = new FormControl();
  country = new FormControl();

  constructor(address: Address) {
    this.street.setValue(address.street);

    this.postcode.setValue(address.postcode);
    this.postcode.setValidators([Validators.pattern(regexp.postcode)]);

    this.cedex.setValue(address.cedex);
    this.cedex.setValidators([Validators.pattern(regexp.cedex)]);

    this.city.setValue(address.city);

    this.country.setValue(address.country);
  }
}
