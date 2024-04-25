import { perimeterTypes } from '../../geo/shared/Perimeter';

export const alias = 'observatory.allCampaigns';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
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
