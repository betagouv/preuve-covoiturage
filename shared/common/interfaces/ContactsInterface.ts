import { ContactInterface } from './ContactInterface.ts';

export interface ContactsInterface {
  technical?: Partial<ContactInterface>;
  gdpr_dpo?: Partial<ContactInterface>;
  gdpr_controller?: Partial<ContactInterface>;
}
