export const userForgottenPasswordSchema = {
  $id: 'user.forgottenPassword',
  type: 'object',
  required: [],
  additionalProperties: false,
  properties: {
    id: {
      type: 'string',
      maxLength: 255,
      minLength: 1,
    },
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
  oneOf: [
    {
      required: ['id'],
    },
    {
      required: ['email'],
    },
  ],
};
