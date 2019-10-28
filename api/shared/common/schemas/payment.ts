export const payment = {
  type: 'object',
  minProperties: 2,
  additionalProperties: false,
  properties: {
    pass_type: { macro: 'varchar' },
    amount: {
      type: 'integer',
      minimum: 0,
      maximum: 100000,
    },
  },
};
