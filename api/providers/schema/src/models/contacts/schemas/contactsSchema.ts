export const contactsSchema = {
  definitions: {
    contact: {
      type: 'object',
      additionalProperties: false,
      properties: {
        firstname: { macro: 'varchar' },
        lastname: { macro: 'varchar' },
        email: { macro: 'email' },
        phone: { macro: 'phone' },
      },
    },
  },
  type: 'object',
  additionalProperties: false,
  properties: {
    gdpr_dpo: { $ref: '#/definitions/contact' },
    gdpr_controller: { $ref: '#/definitions/contact' },
    technical: { $ref: '#/definitions/contact' },
  },
};
