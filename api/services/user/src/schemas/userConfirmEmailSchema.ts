export const userConfirmEmailSchema = {
  $id: 'user.confirmEmail',
  type: 'object',
  required: ['confirm', 'token'],
  additionalProperties: false,
  properties: {
    confirm: { macro: 'token' },
    token: { macro: 'token' },
  },
};
