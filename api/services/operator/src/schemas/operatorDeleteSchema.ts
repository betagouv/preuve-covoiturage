export const operatorDeleteSchema = {
  $id: 'operator.delete',
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: {
      type: 'string',
    },
  },
};
