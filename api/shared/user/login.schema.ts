export const login = {
  $id: 'user.login',
  type: 'object',
  required: ['password', 'email'],
  additionalProperties: false,
  properties: {
    password: { macro: 'password' },
    email: { macro: 'email' },
  },
};

export const alias = login.$id;
