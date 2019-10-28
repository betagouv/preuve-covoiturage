import { company } from '../common/schemas/company';
import { address } from '../common/schemas/address';
import { bank } from '../common/schemas/bank';
import { cgu } from '../common/schemas/cgu';
import { contacts } from '../common/schemas/contacts';

export const alias = 'operator.create';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['nom_commercial', 'raison_sociale'],
  additionalProperties: false,
  properties: {
    company,
    address,
    bank,
    contacts,
    cgu,
    nom_commercial: { macro: 'varchar' },
    raison_sociale: { macro: 'varchar' },
  },
};
export const binding = [alias, schema];
