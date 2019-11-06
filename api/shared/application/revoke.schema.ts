export const alias = 'application.revoke';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['_id'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'dbid' },
    owner_id: { macro: 'dbid' },
    owner_service: { enum: ['operator'] },
  },
};
export const binding = [alias, schema];
