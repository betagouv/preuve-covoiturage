export const applicationCheckSchema = {
  $id: 'application.check',
  type: 'object',
  required: ['_id', 'operator'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'objectid' },
    operator_id: { macro: 'objectid' },
  },
};
