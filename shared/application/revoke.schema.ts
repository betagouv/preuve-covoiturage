export const alias = 'application.revoke';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['_id'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'objectid' },
  },
};
export const binding = [alias, schema];
