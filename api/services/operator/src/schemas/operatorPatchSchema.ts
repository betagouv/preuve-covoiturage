import { companySchema } from './parts/companySchema';
import { addressSchema } from './parts/addressSchema';
import { bankSchema } from './parts/bankSchema';
import { contactsSchema } from './parts/contactsSchema';

export const operatorPatchSchema = {
  '$id': 'operator.patch',
  type: 'object',
  required: ['id', 'patch'],
  additionalProperties: false,
  properties: {
    id: {
      type: 'string',
    },
    patch: {
      type: 'object',
      minProperties: 1,
      additionalProperties: false,
      properties: {
        nom_commercial: {
          type: 'string',
        },
        raison_sociale: {
          type: 'string',
        },
        company: companySchema,
        address: addressSchema,
        bank: bankSchema,
        contacts: contactsSchema,
      },
    },
  },
};