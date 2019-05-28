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
    patch: {
      type: 'object',
      minProperties: 1,
      additionalProperties: false,
      properties: {
        lastname: {
          type: 'string',
          maxLength: 128,
        },
        firstname: {
          type: 'string',
          maxLength: 128,
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
