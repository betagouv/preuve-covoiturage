/* tslint:disable:variable-name */
import { Contact } from './contact';

export class Contacts {
  gdpr_dpo?: Contact;
  gdpr_controller?: Contact;
  technical?: Contact;

  constructor(
    obj: {
      gdpr_dpo?: Contact;
      gdpr_controller?: Contact;
      technical?: Contact;
    } = {},
  ) {
    this.gdpr_dpo = obj.gdpr_dpo || new Contact({ firstname: null, lastname: null, email: null });
    this.gdpr_controller = obj.gdpr_controller || new Contact({ firstname: null, lastname: null, email: null });
    this.technical = obj.technical || new Contact({ firstname: null, lastname: null, email: null });
  }
}
