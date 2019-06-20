import { companySchema } from '../schemas/parts/companySchema';
import { addressSchema } from '../schemas/parts/addressSchema';
import { bankSchema } from '../schemas/parts/bankSchema';
import { contactsSchema } from '../schemas/parts/contactsSchema';
import { cguSchema } from '../schemas/parts/cguSchema';
import { applicationSchema } from '../schemas/parts/applicationSchema';

export const operatorSchema = {
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
    applications: [applicationSchema],
    createdAt: {
      type: 'string',
      format: 'datetime',
    },
    updatedAt: {
      type: 'string',
      format: 'datetime',
    },
    deletedAt: {
      type: 'string',
      format: 'datetime',
    },
  },
};
