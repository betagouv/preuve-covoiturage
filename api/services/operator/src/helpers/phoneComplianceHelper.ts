import { ContactsInterface } from '../shared/common/interfaces/ContactsInterface';

/**
 * Check the operator's contacts compliance
 * Rules :
 * - exclude 0800 numbers
 */

export function phoneComplianceHelper(contacts: Partial<ContactsInterface>): void {
  if (!contacts) return;

  for (const contact of Object.values(contacts)) {
    if ('phone' in contact) {
      if (contact.phone.substr(0, 4) === '+338') {
        throw new Error('0800 phone numbers are not allowed');
      }
    }
  }
}
