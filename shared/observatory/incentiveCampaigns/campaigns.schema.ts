import { perimeterTypes } from '../../geo/shared/Perimeter.ts';

export const alias = 'observatory.campaigns';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    code: {
      anyOf: [{ macro: 'insee' }, { macro: 'department' }, { macro: 'country' }, { macro: 'siren' }],
    },
    type: {
      type: 'string',
      enum: perimeterTypes,
    },
    year: {
      type: 'integer',
      minimum: 2022,
    },
  },
};

export const binding = [alias, schema];
