export const alias = 'application.create';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {
    name: { macro: 'varchar' },
    owner_id: { macro: 'dbid' },
    owner_service: { enum: ['operator'] },
    permissions: {
      type: 'array',
      minItems: 1,
      uniqueItems: true,
      additionalItems: false,
      items: { type: 'string' },
    },
  },
};
export const binding = [alias, schema];
