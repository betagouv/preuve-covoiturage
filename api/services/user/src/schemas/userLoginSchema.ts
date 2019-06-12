export const userLoginSchema = {
  $id: 'user.login',
  type: 'object',
  required: ['password', 'email'],
  additionalProperties: false,
  properties: {
    password: {
      type: 'string',
      minLength: 6,
      maxLength: 128,
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
};
