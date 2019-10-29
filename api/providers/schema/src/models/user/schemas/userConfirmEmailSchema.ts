export const userConfirmEmailSchema = {
  $id: 'user.confirmEmail',
  type: 'object',
  required: ['email', 'forgotten_token'],
  additionalProperties: false,
  properties: {
    email: { macro: 'email' },
    forgotten_token: { macro: 'token' },
  },
};
