export const userDeleteSchema = {
  $id: 'user.delete',
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: {
      type: 'string',
      maxLength: 255,
      minLength: 1,
    },
  },
};
