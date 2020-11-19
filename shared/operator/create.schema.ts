import { company } from '../common/schemas/company';
import { address } from '../common/schemas/address';
import { bank } from '../common/schemas/bank';
import { cgu } from '../common/schemas/cgu';
import { contacts } from '../common/schemas/contacts';
import { meta } from './common/schemas/meta';

export const alias = 'operator.create';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['name', 'legal_name', 'siret'],
  additionalProperties: false,
  properties: {
    company,
    address,
    bank,
    contacts,
    cgu,
    meta,
    name: { macro: 'varchar' },
    legal_name: { macro: 'varchar' },
    siret: { macro: 'siret' },
  },
};
export const binding = [alias, schema];
