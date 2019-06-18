export const userResetPasswordSchema = {
  $id: 'user.resetPassword',
  type: 'object',
  required: ['token', 'reset', 'password'],
  additionalProperties: false,
  properties: {
    password: { macro: 'password' },
    token: { macro: 'token' },
    reset: { macro: 'token' },
  },
};
