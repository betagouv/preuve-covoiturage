export const findIdentity = {
  type: 'object',
  oneOf: [
    {
      additionalProperties: false,
      required: ['phone'],
      properties: {
        phone: { macro: 'phone' },
      },
    },
    {
      // phone_trunc is not mandatory as the identity
      // can be retrieved with an operator_id + operator_user_id tuple
      additionalProperties: false,
      required: ['operator_user_id'],
      properties: {
        phone_trunc: { macro: 'phonetrunc' },
        operator_user_id: { macro: 'varchar' },
      },
    },
  ],
};
