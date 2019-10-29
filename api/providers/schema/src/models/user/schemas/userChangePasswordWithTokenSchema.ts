export const userChangePasswordWithTokenSchema = {
  $id: 'user.changePasswordWithToken',
  type: 'object',
  required: ['email', 'password', 'forgotten_token'],
  additionalProperties: false,
  properties: {
    email: { macro: 'email' },
    password: { macro: 'password' },
    forgotten_token: { macro: 'token' },
  },
};
