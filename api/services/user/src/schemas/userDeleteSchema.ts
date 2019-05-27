export const userDeleteSchema = {
  $id: 'user.delete',
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: {
      type: 'string',
      maxlength: 255,
      minlength: 1,
    },
  },
};
