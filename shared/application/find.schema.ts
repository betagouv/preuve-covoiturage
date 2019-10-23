export const alias = 'application.find';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['_id'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'objectid' },
    operator_id: { macro: 'objectid' },
    deleted_at: { anyOf: [{ macro: 'timestamp' }, { type: 'null' }] },
  },
};
export const binding = [alias, schema];
