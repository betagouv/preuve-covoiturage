import { ContactInterface } from './ContactInterface';

export interface ContactsInterface {
  technical: Partial<ContactInterface>;
  gdpr_dpo: Partial<ContactInterface>;
  gdpr_controller: Partial<ContactInterface>;
}
