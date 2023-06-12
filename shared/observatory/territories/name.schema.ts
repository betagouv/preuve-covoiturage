import { perimeterTypes } from '../../geo/shared/Perimeter';

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
      oneOf: [
        { macro: 'insee' },
        { macro: 'dep' },
        { macro: 'country' },
        { macro: 'siren' },
      ]
    },
    type: {
      type: 'string',
      enum: perimeterTypes,
    },
  },
};

export const binding = [alias, schema];
