import { companySchema } from '../../company';
import { addressSchema } from '../../address';
import { bankSchema } from '../../bank';
import { contactsSchema } from '../../contacts';
import { cguSchema } from '../../cgu';

export const territoryCreateSchema = {
  $id: 'territory.create',
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {
    name: { macro: 'varchar' },
    shortname: { macro: 'varchar' },
    acronym: { macro: 'varchar' },
    insee: {
      type: 'array',
      items: { macro: 'insee' },
    },
    company: companySchema,
    address: addressSchema,
    bank: bankSchema,
    contacts: contactsSchema,
    cgu: cguSchema,
  },
};
