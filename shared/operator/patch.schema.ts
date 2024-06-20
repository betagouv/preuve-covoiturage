import { company } from '../common/schemas/company';
import { address } from '../common/schemas/address';
import { bank } from '../common/schemas/bank';

export const alias = 'operator.patch';

export const schema = {
  $id: alias,
  type: 'object',
  required: ['_id', 'patch'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'serial' },
    patch: {
      type: 'object',
      minProperties: 1,
      additionalProperties: false,
      properties: {
        company,
        address,
        bank,
        thumbnail: { anyOf: [{ macro: 'base64' }, { type: 'null' }] },
        nom_commercial: { macro: 'varchar' },
        raison_sociale: { macro: 'varchar' },
      },
    },
  },
};

export const binding = [alias, schema];
