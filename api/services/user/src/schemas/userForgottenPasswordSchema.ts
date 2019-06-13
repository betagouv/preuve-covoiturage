export const userForgottenPasswordSchema = {
  $id: 'user.forgottenPassword',
  type: 'object',
  required: ['email'],
  additionalProperties: false,
  properties: {
    email: {
      type: 'string',
      format: 'email',
      maxLength: 128,
      minLength: 1,
      // match: regex.email,
      // trim: true,
      // lowercase: true,
      // unique: true,
    },
  },

};
