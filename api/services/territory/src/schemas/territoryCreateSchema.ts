import { companySchema } from './parts/companySchema';
import { addressSchema } from './parts/addressSchema';
import { bankSchema } from './parts/bankSchema';
import { contactsSchema } from './parts/contactsSchema';
import { baseSchema } from './parts/baseSchema';
import { cguSchema } from './parts/cguSchema';

export const territoryCreateSchema = {
  $id: 'territory.create',
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {
    ...baseSchema,
    company: companySchema,
    address: addressSchema,
    bank: bankSchema,
    contacts: contactsSchema,
    cgu: cguSchema,
  },
};
