export const alias = 'observatory.territoriesList';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['year'],
  properties: {
    year: {
      type: 'integer',
      minimum: 2020,
    },
  },
};

export const binding = [alias, schema];
