export const position = {
  type: 'object',
  required: ['datetime'],
  additionalProperties: false,
  minProperties: 2,
  dependencies: {
    lat: ['lon'],
    lon: ['lat'],
    country: ['literal'],
    literal: ['country'],
  },
  properties: {
    datetime: { macro: 'timestamp' },
    lat: { macro: 'lat' },
    lon: { macro: 'lon' },
    insee: { macro: 'insee' },
    country: { macro: 'varchar' },
    literal: { macro: 'longchar' },
  },
};
