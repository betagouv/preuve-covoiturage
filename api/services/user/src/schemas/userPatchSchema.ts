export const userPatchSchema = {
  $id: 'user.patch',
  type: 'object',
  required: ['id', 'patch'],
  additionalProperties: false,
  properties: {
    id: {
      type: 'string',
      format: 'objectid',
      maxLength: 24,
      minLength: 24,
    },
    patch: {
      type: 'object',
      additionalProperties: false,
      anyOf: [{ required: ['lastname'] }, { required: ['firstname'] }, { required: ['phone'] }],
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
          format: 'phone',
          maxLength: 14,
        },
      },
    },
  },
};
