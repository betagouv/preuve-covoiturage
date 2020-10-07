export const alias = 'territory.list';
export const find = {
  $id: alias,
  type: 'object',
  required: ['query'],
  additionalProperties: false,
  properties: {
    query: {
      type: 'object',
      minProperties: 1,
      additionalProperties: false,
      properties: {
        search: { macro: 'varchar' },
        has_child_id: { macro: 'serial' },
        has_parent_id: { macro: 'serial' },
        has_ancestor_id: { macro: 'serial' },
        has_descendant_id: { macro: 'serial' },
        name: { macro: 'varchar' },
        company_name: { macro: 'varchar' },
        active: { type: 'boolean' },
        insee: { macro: 'insee' },
        postcode: { macro: 'postcode' },
        position: {
          type: 'object',
          required: ['lat', 'lon'],
          additionalProperties: false,
          properties: {
            lat: { macro: 'lat' },
            lon: { macro: 'lon' },
          },
        },
      },
    },
    sort: {
      type: 'string',
      enum: ['+name', '-name', '+area', '-area'],
    },
    projection: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['_id', 'level', 'name', 'active', 'company_id'],
      },
    },
  },
};
