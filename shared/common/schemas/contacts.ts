import { contact } from './contact.ts';

export const contacts = {
  type: 'object',
  additionalProperties: false,
  properties: {
    gdpr_dpo: contact,
    gdpr_controller: contact,
    technical: contact,
  },
};
