import { perimeterTypes } from '../../geo/shared/Perimeter';

export const alias = 'observatory.bestMonthlyTerritories';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['year', 'month', 'type', 'observe', 'code'],
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
    observe: {
      type: 'string',
      enum: perimeterTypes,
    },
    code: {
      oneOf: [{ macro: 'insee' }, { macro: 'dep' }, { macro: 'country' }, { macro: 'siren' }],
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
