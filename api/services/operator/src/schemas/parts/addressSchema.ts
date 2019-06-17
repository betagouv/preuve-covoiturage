export const addressSchema = {
  type: 'object',
  required: ['street', 'city', 'country', 'postcode'],
  additionalProperties: false,
  properties: {
    street: {
      type: 'string',
      minLength: 3,
      maxLength: 512,
    },
    city: {
      type: 'string',
      minLength: 1,
      maxLength: 256,
    },
    country: {
      type: 'string',
      minLength: 3,
      maxLength: 256,
    },
    postcode: {
      type: 'string',
      format: 'postcode',
    },
    cedex: {
      type: 'string',
      minLength: 3,
      maxLength: 256,
    },
  },
};
