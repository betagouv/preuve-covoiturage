export const userChangeEmailSchema = {
  $id: 'user.changeEmail',
  type: 'object',
  required: ['id', 'email'],
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
