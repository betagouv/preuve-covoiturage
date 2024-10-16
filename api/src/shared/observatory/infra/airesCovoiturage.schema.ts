import { perimeterTypes } from '../../geo/shared/Perimeter.ts';

export const alias = 'observatory.airesCovoiturage';
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
  },
};

export const binding = [alias, schema];
