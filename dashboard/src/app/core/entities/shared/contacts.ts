/* tslint:disable:variable-name */
import { Contact } from './contact';

export class Contacts {
  rgpd_dpo?: Contact;
  rgpd_controller?: Contact;
  technical?: Contact;

  constructor(
    obj: {
      rgpd_dpo?: Contact;
      rgpd_controller?: Contact;
      technical?: Contact;
    } = {},
  ) {
    this.rgpd_dpo = obj.rgpd_dpo || new Contact({ firstname: null, lastname: null, email: null });
    this.rgpd_controller = obj.rgpd_controller || new Contact({ firstname: null, lastname: null, email: null });
    this.technical = obj.technical || new Contact({ firstname: null, lastname: null, email: null });
  }
}
