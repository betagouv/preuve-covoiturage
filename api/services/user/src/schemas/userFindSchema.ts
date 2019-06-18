export const userFindSchema = {
  $id: 'user.find',
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: { macro: 'objectid' },
  },
};
