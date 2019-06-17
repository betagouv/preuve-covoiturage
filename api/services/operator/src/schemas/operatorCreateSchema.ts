import { companySchema } from './parts/companySchema';
import { addressSchema } from './parts/addressSchema';
import { bankSchema } from './parts/bankSchema';
import { contactsSchema } from './parts/contactsSchema';
import { cguSchema } from './parts/cguSchema';

export const operatorCreateSchema = {
  $id: 'operator.create',
  type: 'object',
  required: ['nom_commercial', 'raison_sociale'],
  additionalProperties: false,
  properties: {
    nom_commercial: {
      type: 'string',
      minLength: 3,
      maxLength: 256,
    },
    raison_sociale: {
      type: 'string',
      minLength: 3,
      maxLength: 256,
    },
    company: companySchema,
    address: addressSchema,
    bank: bankSchema,
    contacts: contactsSchema,
    cgu: cguSchema,
  },
};
