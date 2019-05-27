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
          maxLength: 255,
          // ObjectId
        },
        aom: {
          type: 'string',
          maxLength: 255,
          // ObjectId
        },
      },
      allOf: [
        {
          if: {
            properties: { group: { const: 'aom' } },
          },
          then: {
            required: ['aom'],
          },
        },
        {
          if: {
            properties: { group: { const: 'operator' } },
          },
          then: {
            required: ['operator'],
          },
        },
      ],
    },
  },
};
