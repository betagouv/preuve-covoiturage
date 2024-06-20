import { contact } from './contact';

export const contacts = {
  type: 'object',
  additionalProperties: false,
  properties: {
    gdpr_dpo: contact,
    gdpr_controller: contact,
    technical: contact,
  },
};
