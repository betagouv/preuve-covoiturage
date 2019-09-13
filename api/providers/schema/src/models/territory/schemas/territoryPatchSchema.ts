import { companySchema } from '../../company';
import { addressSchema } from '../../address';
import { bankSchema } from '../../bank';
import { contactsSchema } from '../../contacts';
import { cguSchema } from '../../cgu';

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
        name: { macro: 'varchar' },
        shortname: { macro: 'varchar' },
        acronym: { macro: 'varchar' },
        insee: {
          type: 'array',
          minItems: 1,
          items: { macro: 'insee' },
        },
        insee_main: { macro: 'insee' },
        network_id: { type: 'integer' },
        company: companySchema,
        address: addressSchema,
        bank: bankSchema,
        contacts: contactsSchema,
        cgu: cguSchema,
      },
    },
  },
};
