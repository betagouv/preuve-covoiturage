export const changePasswordWithToken = {
  $id: 'user.changePasswordWithToken',
  type: 'object',
  required: ['email', 'password', 'token'],
  additionalProperties: false,
  properties: {
    email: { macro: 'email' },
    password: { macro: 'password' },
    token: { macro: 'token' },
  },
};

export const alias = changePasswordWithToken.$id;
