export const forgottenPassword = {
  $id: 'user.forgottenPassword',
  type: 'object',
  required: ['email'],
  additionalProperties: false,
  properties: {
    email: { macro: 'email' },
  },
};

export const alias = forgottenPassword.$id;
