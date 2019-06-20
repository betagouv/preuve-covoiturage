import { addressSchema } from '../schemas/parts/addressSchema';
import { baseSchema } from '../schemas/parts/baseSchema';
import { companySchema } from '../schemas/parts/companySchema';
import { contactsSchema } from '../schemas/parts/contactsSchema';
import { cguSchema } from '../schemas/parts/cguSchema';
import { timestampSchema } from '../schemas/parts/timestampSchema';

export const territorySchema = {
  $id: 'territory',
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {
    ...baseSchema,
    ...timestampSchema,
    company: companySchema,
    address: addressSchema,
    contacts: contactsSchema,
    cgu: cguSchema,
    geometry: {
      type: 'object',
      required: [],
      additionalProperties: false,
      properties: {
        type: {
          type: 'string',
          default: 'MultiPolygon',
        },
        coordinates: {
          type: 'array',
        },
      },
    },
  },
};
