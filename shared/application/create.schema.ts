export const alias = 'application.create';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {
    name: { macro: 'varchar' },
    owner_id: { macro: 'serial' },
    owner_service: { enum: ['operator'], default: 'operator' },
    permissions: {
      type: 'array',
      minItems: 1,
      uniqueItems: true,
      items: { type: 'string' },
    },
  },
};
export const binding = [alias, schema];
