export const applicationAllSchema = {
  $id: 'application.all',
  type: 'object',
  required: ['operator_id'],
  additionalProperties: false,
  properties: {
    operator_id: { macro: 'objectid' },
  },
};
