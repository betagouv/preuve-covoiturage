export const addressSchema = {
  type: 'object',
  required: [],
  additionalProperties: false,
  properties: {
    street: {
      type: 'string',
    },
    city: {
      type: 'string',
    },
    country: {
      type: 'string',
    },
    postcode: {
      type: 'string',
      // match: regex.postcode,
    },
    cedex: {
      type: 'string',
      // match: regex.cedex
    },
  },
};
