export const userDeleteSchema = {
  $id: 'user.delete',
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: { macro: 'objectid' },
  },
};
