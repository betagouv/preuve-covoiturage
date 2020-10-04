export const alias = 'territory.dropdown';
export const dropdown = {
  $id: alias,
  type: 'object',
  additionalProperties: false,
  properties: {
    search: {
      type: 'string',
      minLength: 1,
      maxLength: 256,
    },
    on_territories: {
      type: 'array',
      items: { macro: 'serial' },
    },
    limit: {
      type: 'integer',
      minimum: 1,
      maximum: 50000,
    },
  },
};
