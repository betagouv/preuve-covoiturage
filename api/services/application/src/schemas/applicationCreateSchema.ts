export const applicationCreateSchema = {
  $id: 'application.create',
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
