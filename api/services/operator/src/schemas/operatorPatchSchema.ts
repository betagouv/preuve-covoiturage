import { companySchema } from './parts/companySchema';
import { addressSchema } from './parts/addressSchema';
import { bankSchema } from './parts/bankSchema';
import { contactsSchema } from './parts/contactsSchema';

export const operatorPatchSchema = {
  $id: 'operator.patch',
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
        nom_commercial: { macro: 'varchar' },
        raison_sociale: { macro: 'varchar' },
        company: companySchema,
        address: addressSchema,
        bank: bankSchema,
        contacts: contactsSchema,
      },
    },
  },
};
