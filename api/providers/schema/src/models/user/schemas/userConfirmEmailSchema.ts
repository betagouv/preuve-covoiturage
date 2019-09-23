export const userConfirmEmailSchema = {
  $id: 'user.confirmEmail',
  type: 'object',
  required: ['email', 'token'],
  additionalProperties: false,
  properties: {
    email: { macro: 'email' },
    token: { macro: 'token' },
  },
};
