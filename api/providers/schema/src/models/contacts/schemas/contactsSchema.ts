import { contactSchema } from './contactSchema';

export const contactsSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    gdpr_dpo: contactSchema,
    gdpr_controller: contactSchema,
    technical: contactSchema,
  },
};
