export const findIdentity = {
  type: 'object',
  additionalProperties: false,
  minProperties: 1,
  maxProperties: 2,
  properties: {
    phone: { macro: 'phone' },
    phone_trunc: { macro: 'phonetrunc' },
    operator_user_id: { macro: 'varchar' },
  },
  dependencies: {
    phone_trunc: ['operator_user_id'],
    operator_user_id: ['phone_trunc'],
  },
};
