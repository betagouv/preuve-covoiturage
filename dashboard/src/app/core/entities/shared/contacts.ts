import { AbstractControl } from '@angular/forms';
import { hasOneNotEmptyProperty, removeNullsProperties } from '~/core/entities/utils';
import { ContactsInterface } from '../api/shared/common/interfaces/ContactsInterface';
/* tslint:disable:variable-name */
import { Contact } from './contact';

export class Contacts {
  gdpr_dpo?: Contact;
  gdpr_controller?: Contact;
  technical?: Contact;

  constructor(obj?: { gdpr_dpo?: Contact; gdpr_controller?: Contact; technical?: Contact }) {
    if (obj && hasOneNotEmptyProperty(obj.gdpr_dpo)) this.gdpr_dpo = new Contact(obj.gdpr_dpo);
    if (obj && hasOneNotEmptyProperty(obj.gdpr_controller)) this.gdpr_controller = new Contact(obj.gdpr_controller);
    if (obj && hasOneNotEmptyProperty(obj.technical)) this.technical = new Contact(obj.technical);
  }

  toFormValues(): { gdpr_dpo: Contact; gdpr_controller: Contact; technical: Contact } {
    return {
      gdpr_dpo: new Contact(this.gdpr_dpo).toFormValues(),
      gdpr_controller: new Contact(this.gdpr_controller).toFormValues(),
      technical: new Contact(this.technical).toFormValues(),
    };
  }
}

export class ContactsMapper {
  public static toModel(contactForm: AbstractControl): ContactsInterface {
    const contacts: ContactsInterface = {};
    if (hasOneNotEmptyProperty(contactForm.get('gdpr_controller').value))
      contacts.gdpr_controller = removeNullsProperties(contactForm.get('gdpr_controller').value);
    if (hasOneNotEmptyProperty(contactForm.get('technical').value))
      contacts.technical = removeNullsProperties(contactForm.get('technical').value);
    if (hasOneNotEmptyProperty(contactForm.get('gdpr_dpo').value))
      contacts.gdpr_dpo = removeNullsProperties(contactForm.get('gdpr_dpo').value);
    return contacts;
  }
}
