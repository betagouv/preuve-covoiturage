import { companySchema } from './parts/companySchema';
import { addressSchema } from './parts/addressSchema';
import { bankSchema } from './parts/bankSchema';
import { contactsSchema } from './parts/contactsSchema';

export const operatorCreateSchema = {
  '$id': 'operator.create',
  type: 'object',
  required: ['nom_commercial', 'raison_sociale'],
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
};