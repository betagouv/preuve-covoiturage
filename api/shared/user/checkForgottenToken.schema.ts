export const checkForgottenToken = {
  $id: 'user.checkForgottenToken',
  type: 'object',
  required: ['email', 'token'],
  additionalProperties: false,
  properties: {
    email: { macro: 'email' },
    token: { macro: 'token' },
  },
};

export const alias = checkForgottenToken.$id;
