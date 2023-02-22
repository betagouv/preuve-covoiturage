export const alias = 'observatory.territoryName';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['year', 'code', 'type'],
  properties: {
    year: {
      type: 'integer',
      minimum: 2020,
    },
    code: {
      type: 'string',
      minLength: 2,
      maxLength: 9,
    },
    type: {
      type: 'string',
      enum: ['com', 'epci', 'aom', 'dep', 'reg', 'country'],
    },
  },
};

export const binding = [alias, schema];
