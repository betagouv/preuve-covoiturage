const pointSchema = {
  type: 'object',
  required: ['lat', 'lon'],
  additionalProperties: false,
  properties: {
    lat: { macro: 'lat' },
    lon: { macro: 'lon' },
  },
};
export const alias = 'geo.getRouteMeta';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['start', 'end'],
  additionalProperties: false,
  properties: {
    start: pointSchema,
    end: pointSchema,
  },
};

export const binding = [alias, schema];
