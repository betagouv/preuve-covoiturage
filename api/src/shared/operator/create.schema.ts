import { company } from '../common/schemas/company.ts';
import { address } from '../common/schemas/address.ts';
import { bank } from '../common/schemas/bank.ts';
import { cgu } from '../common/schemas/cgu.ts';
import { contacts } from '../common/schemas/contacts.ts';

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
    name: { macro: 'varchar' },
    legal_name: { macro: 'varchar' },
    siret: { macro: 'siret' },
    thumbnail: { anyOf: [{ macro: 'base64' }, { type: 'null' }] },
  },
};
export const binding = [alias, schema];
