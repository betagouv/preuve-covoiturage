import { companySchema } from '../../company';
import { addressSchema } from '../../address';
import { bankSchema } from '../../bank';
import { contactsSchema } from '../../contacts';

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
        // contacts: contactsSchema,
      },
    },
  },
};
