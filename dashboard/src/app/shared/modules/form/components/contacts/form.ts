import { FormControl, Validators } from '@angular/forms';

import { Contact } from '~/entities/database/contact';
import { regexp } from '~/entities/validators';

export class ContactsForm {
  phone = new FormControl();
  email = new FormControl();
  rgpd_dpo = new FormControl();  // tslint:disable-line variable-name
  rgpd_controller = new FormControl();  // tslint:disable-line variable-name
  technical = new FormControl();

  constructor(contacts: Contact) {
    this.phone.setValue(contacts.phone);

    this.email.setValue(contacts.email);
    this.email.setValidators([Validators.pattern(regexp.email)]);

    this.rgpd_dpo.setValue(contacts.rgpd_dpo);
    this.rgpd_controller.setValue(contacts.rgpd_controller);
    this.technical.setValue(contacts.technical);
  }
}
