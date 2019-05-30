export const userPatchSchema = {
  $id: 'user.patch',
  type: 'object',
  required: ['id', 'patch'],
  additionalProperties: false,
  properties: {
    id: {
      type: 'string',
      maxLength: 255,
      minLength: 1,
    },
    aom: {
      type: 'string',
      maxLength: 255,
      minLength: 1,
    },
    operator: {
      type: 'string',
      maxLength: 255,
      minLength: 1,
    },
    password: {
      type: 'string',
      maxLength: 128,
      minLength: 1,
    },
    patch: {
      type: 'object',
      minProperties: 1,
      additionalProperties: false,
      properties: {
        oldPassword: {
          type: 'string',
          maxLength: 128,
          minLength: 6,
        },
        newPassword: {
          type: 'string',
          maxLength: 128,
          minLength: 6,
        },
        lastname: {
          type: 'string',
          maxLength: 128,
        },
        firstname: {
          type: 'string',
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
        phone: {
          type: 'string',
          // match: regex.phone,
          // set: setters.phone,
          // validate: validators.phone,
          // trim: true,
          maxLength: 128,
        },
        role: {
          type: 'string',
          enum: ['admin', 'user'],
        },
      },
    },
  },
};

// email
// password
// password confirmation
