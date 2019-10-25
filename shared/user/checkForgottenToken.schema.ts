export const checkForgottenToken = {
  $id: 'user.checkForgottenToken',
  type: 'object',
  required: ['email', 'forgotten_token'],
  additionalProperties: false,
  properties: {
    email: { macro: 'email' },
    forgotten_token: { macro: 'token' },
  },
};

export const alias = checkForgottenToken.$id;
