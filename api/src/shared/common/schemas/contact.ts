export const contact = {
  type: 'object',
  additionalProperties: false,
  minProperties: 1,
  properties: {
    firstname: { macro: 'varchar' },
    lastname: { macro: 'varchar' },
    email: { macro: 'email' },
    phone: { macro: 'phone' },
  },
};
