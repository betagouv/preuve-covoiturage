import { perimeterTypes } from '../../geo/shared/Perimeter';

export const alias = 'observatory.getLocation';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['start_date', 'end_date', 'zoom'],
  properties: {
    start_date: {
      type: 'string',
      format: 'date',
      minLength: 10,
      maxLength: 10,
    },
    end_date: {
      type: 'string',
      format: 'date',
      minLength: 10,
      maxLength: 10,
    },
    zoom: {
      type: 'integer',
      minimum: 0,
      maximum: 8,
    },
    type: {
      type: 'string',
      enum: perimeterTypes,
    },
    code: {
      anyOf: [{ macro: 'insee' }, { macro: 'department' }, { macro: 'country' }, { macro: 'siren' }],
    },
  },
};

export const binding = [alias, schema];
