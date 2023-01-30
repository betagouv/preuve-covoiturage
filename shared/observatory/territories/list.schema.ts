export const alias = 'observatory.territoriesList';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['year'],
  properties: {
    year: {
      type: 'integer',
      minimum: 2020,
      maximum: new Date().getFullYear(),
    },
  },
};

export const binding = [alias, schema];
