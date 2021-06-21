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
      additionalProperties: false,
      required: ['phone_trunc', 'operator_user_id'],
      properties: {
        phone_trunc: { macro: 'phonetrunc' },
        operator_user_id: { macro: 'varchar' },
      },
    },
  ],
};
