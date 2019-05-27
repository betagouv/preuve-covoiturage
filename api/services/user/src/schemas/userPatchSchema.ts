export const userPatchSchema = {
  $id: 'user.patch',
  type: 'object',
  required: ['id', 'patch'],
  additionalProperties: false,
  properties: {
    id: {
      type: 'string',
      maxlength: 255,
      minlength: 1,
    },
    patch: {
      type: 'object',
      minProperties: 1,
      additionalProperties: false,
      properties: {
        lastname: {
          type: 'string',
          maxlength: 128,
        },
        firstname: {
          type: 'string',
          maxlength: 128,
        },
        phone: {
          type: 'string',
          // match: regex.phone,
          // set: setters.phone,
          // validate: validators.phone,
          // trim: true,
          maxlength: 128,
        },
        group: {
          type: 'string',
          enum: ['aom', 'operators', 'registry'],
        },
        role: {
          type: 'string',
          default: 'user',
          enum: ['admin', 'user'],
        },
        operator: {
          type: 'string',
          maxlength: 255,
          // ObjectId
        },
        aom: {
          type: 'string',
          maxlength: 255,
          // ObjectId
        },
      },
    },
  },
};
