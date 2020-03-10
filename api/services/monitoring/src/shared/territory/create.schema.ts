import { company } from '../common/schemas/company';
import { address } from '../common/schemas/address';
import { bank } from '../common/schemas/bank';
import { contacts } from '../common/schemas/contacts';
import { cgu } from '../common/schemas/cgu';

export const alias = 'territory.create';
export const create = {
  $id: alias,
  type: 'object',
  required: ['name', 'siret'],
  additionalProperties: false,
  properties: {
    company,
    address,
    bank,
    contacts,
    cgu,
    name: { macro: 'varchar' },
    shortname: { macro: 'varchar' },
    siret: { macro: 'siret' },
    insee: {
      type: 'array',
      items: { macro: 'insee' },
    },
  },
};
