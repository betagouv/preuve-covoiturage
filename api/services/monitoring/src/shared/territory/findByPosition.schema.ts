export const alias = 'territory.findByPosition';
export const findByPosition = {
  $id: alias,
  type: 'object',
  required: ['lat', 'lon'],
  additionalProperties: false,
  properties: {
    lat: { macro: 'lat' },
    lon: { macro: 'lon' },
  },
};
