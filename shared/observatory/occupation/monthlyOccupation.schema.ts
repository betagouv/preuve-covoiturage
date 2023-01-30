export const alias = 'observatory.monthlyOccupation';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['year', 'month', 't'],
  properties: {
    year: {
      type: 'integer',
      minimum: 2020,
      maximum: new Date().getFullYear(),
    },
    month: {
      type: 'integer',
      minimum: 1,
      maximum: 12,
    },
    t: {
      type: 'string',
      enum: ['com', 'epci', 'aom', 'dep', 'reg', 'country'],
    },
    t2: {
      type: 'string',
      enum: ['com', 'epci', 'aom', 'dep', 'reg', 'country'],
    },
    code: {
      type: 'string',
      minLength: 2,
      maxLength: 9,
    },
  },
};

export const binding = [alias, schema];
