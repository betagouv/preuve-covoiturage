export const paymentSchema = {
  type: 'object',
  minProperties: 2,
  additionalProperties: false,
  properties: {
    pass_type: { macro: 'varchar', enum: ['cb', 'prepaid'] },
    amount: {
      type: 'integer',
      minimum: 0,
      maximum: 100000,
    },
  },
};
