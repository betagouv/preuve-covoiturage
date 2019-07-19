/* tslint:disable:variable-name */
import { Contact } from './contact';

export class Contacts {
  rgpd_dpo?: Contact;
  rgpd_controller?: Contact;
  technical?: Contact;

  constructor(obj: {
    rgpd_dpo?: Contact,
    rgpd_controller?: Contact,
    technical?: Contact,
  } = {}) {
    this.rgpd_dpo = obj.rgpd_dpo;
    this.rgpd_controller = obj.rgpd_controller;
    this.technical = obj.technical;
  }
}
