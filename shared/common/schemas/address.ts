export const address = {
  type: 'object',
  required: ['street', 'city', 'country', 'postcode'],
  additionalProperties: false,
  properties: {
    street: { macro: 'longchar' },
    city: { macro: 'varchar' },
    country: { macro: 'varchar' },
    postcode: { macro: 'postcode' },
    cedex: { macro: 'varchar' },
  },
};
