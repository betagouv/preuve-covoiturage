export const alias = 'application.create';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['name', 'operator_id', 'permissions'],
  additionalProperties: false,
  properties: {
    name: { macro: 'varchar' },
    operator_id: { macro: 'objectid' },
    permissions: {
      type: 'array',
      minItems: 1,
      uniqueItems: true,
      additionalItems: false,
      items: {
        type: 'string',
      },
    },
  },
};
export const binding = [alias, schema];
