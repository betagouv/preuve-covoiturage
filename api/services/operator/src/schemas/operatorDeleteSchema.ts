export const operatorDeleteSchema = {
  $id: 'operator.delete',
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: { macro: 'objectid' },
  },
};
