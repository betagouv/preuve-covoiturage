export const alias = 'observatory.bestMonthlyFlux';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['year', 'month', 'type', 'code'],
  properties: {
    year: {
      type: 'integer',
      minimum: 2020,
    },
    month: {
      type: 'integer',
      minimum: 1,
      maximum: 12,
    },
    type: {
      type: 'string',
      enum: perimeterTypes,
    },
    code: {
      type: 'string',
      minLength: 2,
      maxLength: 9,
    },
    limit: {
      type: 'integer',
      minimum: 5,
      maximum: 100,
      default: 10,
    },
  },
};

export const binding = [alias, schema];
