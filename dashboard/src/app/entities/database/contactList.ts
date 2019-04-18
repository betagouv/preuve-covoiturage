import { Contact } from './contact';

export class ContactList {
  rgpd_dpo: Contact;
  rgpd_controller: Contact;
  technical: Contact;

  constructor(obj?: any) {
    this.rgpd_dpo = obj && obj.rgpd_dpo || null;
    this.rgpd_controller = obj && obj.rgpd_controller || null;
    this.technical = obj && obj.technical || null;
  }
}
