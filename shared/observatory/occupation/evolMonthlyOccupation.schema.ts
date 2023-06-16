import { indicTypes, perimeterTypes } from '../../geo/shared/Perimeter';

export const alias = 'observatory.evolMonthlyOccupation';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['year', 'month', 'type', 'code', 'indic'],
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
      oneOf: [{ macro: 'insee' }, { macro: 'dep' }, { macro: 'country' }, { macro: 'siren' },]
    },
    indic: {
      type: 'string',
      enum: indicTypes,
    },
    past: {
      type: 'string',
      minLength: 1,
      maxLength: 2,
      default: '2',
    },
  },
};

export const binding = [alias, schema];
