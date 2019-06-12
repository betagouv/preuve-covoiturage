export const userResetPasswordSchema = {
  $id: 'user.resetPassword',
  type: 'object',
  required: ['token', 'reset', 'password'],
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
    reset: {
      type: 'string',
      maxLength: 255,
      minLength: 1,
    },
  },
};
