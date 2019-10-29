export const incentiveSchema = {
  type: 'object',
  additionalProperties: false,
  minProperties: 3,
  properties: {
    index: {
      type: 'integer',
      minimum: 0,
      maximum: 42,
    },
    siret: { macro: 'siret' },
    amount: {
      type: 'number',
      minimum: 0,
      maximum: 100000,
    },
  },
};
