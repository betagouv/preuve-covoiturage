import { identity } from './common/identity.schema';

export const alias = 'carpool.finduuid';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['identity'],
  additionalProperties: false,
  properties: {
    identity,
    operator_id: { macro: 'serial' },
  },
};

export const binding = [alias, schema];
