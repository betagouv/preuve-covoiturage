export const userResetPasswordSchema = {
  $id: 'user.resetPassword',
  type: 'object',
  required: ['email', 'token', 'password'],
  additionalProperties: false,
  properties: {
    email: { macro: 'email' },
    token: { macro: 'token' },
    password: { macro: 'password' },
  },
};
