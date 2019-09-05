import { FormControl, Validators } from '@angular/forms';

import { Contact } from '~/core/entities/shared/contact';
import { REGEXP } from '~/core/const/validators.const';

export class FormContact {
  firstname = new FormControl();
  lastname = new FormControl();
  email = new FormControl();
  phone = new FormControl();

  constructor(contact: Contact) {
    this.firstname.setValue(contact.firstname);
    this.lastname.setValue(contact.lastname);

    this.email.setValue(contact.email);
    this.email.setValidators([Validators.pattern(REGEXP.email)]);

    this.phone.setValue(contact.phone);
    this.phone.setValidators([Validators.pattern(REGEXP.phone)]);
  }
}
