export const payment = {
  type: 'object',
  required: ['index', 'siret', 'type', 'amount'],
  additionalProperties: false,
  properties: {
    index: {
      type: 'integer',
      minimum: 0,
      maximum: 19,
    },
    siret: { macro: 'siret' },
    type: { macro: 'varchar' },
    amount: {
      type: 'integer',
      minimum: 0,
      maximum: 100000,
    },
  },
};
