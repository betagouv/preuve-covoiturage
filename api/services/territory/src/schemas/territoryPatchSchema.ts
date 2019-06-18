import { companySchema } from './parts/companySchema';
import { addressSchema } from './parts/addressSchema';
import { bankSchema } from './parts/bankSchema';
import { contactsSchema } from './parts/contactsSchema';
import { baseSchema } from './parts/baseSchema';

export const territoryPatchSchema = {
  $id: 'territory.patch',
  type: 'object',
  required: ['id', 'patch'],
  additionalProperties: false,
  properties: {
    id: { macro: 'objectid' },
    patch: {
      type: 'object',
      minProperties: 1,
      additionalProperties: false,
      properties: {
        ...baseSchema,
        company: companySchema,
        address: addressSchema,
        bank: bankSchema,
        contacts: contactsSchema,
      },
    },
  },
};
