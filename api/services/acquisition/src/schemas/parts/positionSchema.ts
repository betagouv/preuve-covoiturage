export const positionSchema = {
  type: 'object',
  required: ['datetime'],
  additionalProperties: false,
  minProperties: 2,
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
    literal: { macro: 'longchar' },
    country: { macro: 'varchar' },
  },
};
