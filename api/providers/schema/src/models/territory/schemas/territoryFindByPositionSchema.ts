export const territoryFindByPositionSchema = {
  $id: 'territory.findByPosition',
  type: 'object',
  required: ['lat', 'lon'],
  additionalProperties: false,
  properties: {
    lat: { macro: 'lat' },
    lon: { macro: 'lon' },
  },
};
