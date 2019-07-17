export const contactsSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    gdpr_dpo: { macro: 'objectid' },
    gdpr_controller: { macro: 'objectid' },
    technical: { macro: 'objectid' },
  },
};
