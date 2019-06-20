import { companySchema } from './parts/companySchema';
import { addressSchema } from './parts/addressSchema';
import { bankSchema } from './parts/bankSchema';
import { contactsSchema } from './parts/contactsSchema';
import { baseSchema } from './parts/baseSchema';
import { cguSchema } from './parts/cguSchema';

export const territoryPatchSchema = {
  $id: 'territory.patch',
  type: 'object',
  required: ['_id', 'patch'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'objectid' },
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
        cgu: cguSchema,
      },
    },
  },
};
