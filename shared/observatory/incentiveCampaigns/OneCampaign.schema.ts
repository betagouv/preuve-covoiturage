import { perimeterTypes } from '../../geo/shared/Perimeter';

export const alias = 'observatory.oneCampaign';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['type', 'code'],
  properties: {
    type: {
      type: 'string',
      enum: perimeterTypes,
    },
    code: {
      anyOf: [{ macro: 'insee' }, { macro: 'department' }, { macro: 'country' }, { macro: 'siren' }],
    },
    year: {
      type: 'integer',
      minimum: 2022,
    },
  },
};

export const binding = [alias, schema];
