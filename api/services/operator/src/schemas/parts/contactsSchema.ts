export const contactsSchema = {
  type: 'object',
  required: [],
  additionalProperties: false,
  properties: {
    rgpd_dpo: { macro: 'objectid' },
    rgpd_controller: { macro: 'objectid' },
    technical: { macro: 'objectid' },
  },
};
