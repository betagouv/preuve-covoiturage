export const userFindSchema = {
  $id: 'user.find',
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
