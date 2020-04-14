export const alias = 'territory.find';
export const find = {
  $id: alias,
  type: 'object',
  required: ['query'],
  additionalProperties: false,
  properties: {
    query: {
      type: 'object',
      minProperties: 1,
      maxProperties: 2,
      additionalProperties: false,
      properties: {
        _id: { macro: 'serial' },
        insee: { macro: 'insee' },
        postcode: { macro: 'postcode' },
        active: { type: 'boolean' },
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
        enum: [
          '_id',
          'level',
          'name',
          'active',
          'company_id',
          'density',
          'geo',
          'children',
          'parents',
          'descendants',
          'ancestors',
          'insee',
          'postcode',
          'active_since',
          'contacts',
          'created_at',
          'updated_at',
        ],
      },
    },
  },
};
