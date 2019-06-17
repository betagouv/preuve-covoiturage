export const contactsSchema = {
  type: 'object',
  required: [],
  additionalProperties: false,
  properties: {
    rgpd_dpo: {
      type: 'string',
      format: 'objectid',
    },
    rgpd_controller: {
      type: 'string',
      format: 'objectid',
    },
    technical: {
      type: 'string',
      format: 'objectid',
    },
  },
};
