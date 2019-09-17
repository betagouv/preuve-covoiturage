export const distanceFilterSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    min: {
      type: 'integer',
      minimum: 0,
      maximum: 100000,
    },
    max: {
      type: 'integer',
      minimum: 0,
      maximum: 100000,
    },
  },
};
