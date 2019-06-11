export const userForgottenPasswordSchema = {
  $id: 'user.resetPassword',
  type: 'object',
  required: ['token', 'password'],
  additionalProperties: false,
  properties: {
    password: {
      type: 'string',
      maxLength: 255,
      minLength: 6,
    },
    token: {
      type: 'string',
      maxLength: 255,
      minLength: 1,
    },
  },
};
