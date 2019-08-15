import { FormControl } from '@angular/forms';

import { ContactList } from '~/entities/database/contactList';

export class ContactsForm {
  rgpd_dpo = new FormControl(); // tslint:disable-line variable-name
  rgpd_controller = new FormControl(); // tslint:disable-line variable-name
  technical = new FormControl();

  constructor(contacts: ContactList) {
    this.rgpd_dpo.setValue(contacts.rgpd_dpo);
    this.rgpd_controller.setValue(contacts.rgpd_controller);
    this.technical.setValue(contacts.technical);
  }
}
