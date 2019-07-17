import { companySchema } from '../../company';
import { addressSchema } from '../../address';
import { bankSchema } from '../../bank';
import { cguSchema } from '../../cgu';
import { contactsSchema } from '../../contacts';

export const operatorCreateSchema = {
  $id: 'operator.create',
  type: 'object',
  required: ['nom_commercial', 'raison_sociale'],
  additionalProperties: false,
  properties: {
    nom_commercial: { macro: 'varchar' },
    raison_sociale: { macro: 'varchar' },
    company: companySchema,
    address: addressSchema,
    bank: bankSchema,
    contacts: contactsSchema,
    cgu: cguSchema,
  },
};
