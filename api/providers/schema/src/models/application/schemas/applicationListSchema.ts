export const applicationListSchema = {
  $id: 'application.list',
  type: 'object',
  required: ['operator_id'],
  additionalProperties: false,
  properties: {
    operator_id: { macro: 'objectid' },
  },
};
