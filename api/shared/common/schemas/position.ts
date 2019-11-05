export const position = {
  type: 'object',
  required: ['datetime'],
  additionalProperties: false,
  minProperties: 1,
  dependencies: {
    lat: ['lon'],
    lon: ['lat'],
    country: ['literal'],
  },
  properties: {
    datetime: { macro: 'timestamp' },
    lat: { macro: 'lat' },
    lon: { macro: 'lon' },
    insee: { macro: 'insee' },
    postcodes: {
      type: 'array',
      items: { type: 'string' },
      minItems: 0,
    },
    town: { macro: 'varchar' },
    country: { macro: 'varchar' },
    literal: { macro: 'longchar' },
    territories: {
      type: 'array',
      minItems: 0,
      items: { macro: 'dbid' },
    },
  },
};
