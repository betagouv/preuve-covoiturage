import { FormControl, Validators } from '@angular/forms';
import { REGEXP } from '~/core/const/validators.const';
import { ContactInterface } from '~/shared/common/interfaces/ContactInterface';

export class FormContact {
  firstname = new FormControl();
  lastname = new FormControl();
  email = new FormControl();
  phone = new FormControl();

  constructor(contact?: ContactInterface) {
    this.email.setValidators([Validators.pattern(REGEXP.email)]);
    this.phone.setValidators([Validators.pattern(REGEXP.phone)]);
    if (contact) {
      this.firstname.setValue(contact.firstname);
      this.lastname.setValue(contact.lastname);
      this.email.setValue(contact.email);
      this.phone.setValue(contact.phone);
    }
  }
}
