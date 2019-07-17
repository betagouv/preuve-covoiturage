export const operatorDeleteSchema = {
  $id: 'operator.delete',
  type: 'object',
  required: ['_id'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'objectid' },
  },
};
