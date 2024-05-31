import { perimeterTypes } from '../../geo/shared/Perimeter.ts';

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
      anyOf: [{ macro: 'insee' }, { macro: 'department' }, { macro: 'country' }, { macro: 'siren' }],
    },
    type: {
      type: 'string',
      enum: perimeterTypes,
    },
  },
};

export const binding = [alias, schema];
