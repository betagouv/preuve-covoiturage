export const userForgottenPasswordSchema = {
  $id: 'user.forgottenPassword',
  type: 'object',
  required: ['email'],
  additionalProperties: false,
  properties: {
    email: { macro: 'email' },
  },
};
