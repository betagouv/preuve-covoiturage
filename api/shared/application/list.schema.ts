export const alias = 'application.list';
export const schema = {
  $id: alias,
  type: 'object',
  additionalProperties: false,
  properties: {
    owner_id: { macro: 'dbid' },
    owner_service: { enum: ['operator'] },
  },
};
export const binding = [alias, schema];
