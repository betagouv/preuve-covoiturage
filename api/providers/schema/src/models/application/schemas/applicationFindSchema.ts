export const applicationFindSchema = {
  $id: 'application.find',
  type: 'object',
  required: ['_id'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'objectid' },
    operator_id: { macro: 'objectid' },
    deleted_at: { anyOf: [{ macro: 'timestamp' }, { type: 'null' }] },
  },
};
