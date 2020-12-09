export const identity = {
  type: 'object',
  additionalProperties: false,
  anyOf: [{ required: ['phone'] }, { required: ['phone_trunc', 'operator_user_id'] }],
  properties: {
    firstname: { macro: 'varchar' },
    lastname: { macro: 'varchar' },
    email: { macro: 'email' },
    phone: { macro: 'phone' },
    company: { macro: 'varchar' },
    over_18: { enum: [true, false, null] },
    phone_trunc: { macro: 'varchar' },
    operator_user_id: { macro: 'varchar' },
    travel_pass_name: { macro: 'varchar' },
    travel_pass_user_id: { macro: 'varchar' },
  },
};
