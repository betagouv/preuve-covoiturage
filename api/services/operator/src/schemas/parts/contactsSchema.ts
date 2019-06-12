export const contactsSchema = {
  type: 'object',
  required: [],
  additionalProperties: false,
  properties: {
    rgpd_dpo: {
      type: 'string', // ObjectId
    },
    rgpd_controller: {
      type: 'string', // ObjectId
    },
    technical: {
      type: 'string', // ObjectId
    },
  },
};
