import { findIdentity } from '../common/schemas/findIdentity';

export const alias = 'carpool.finduuid';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['identity'],
  additionalProperties: false,
  properties: {
    identity: findIdentity,
    operator_id: { macro: 'serial' },
  },
};

export const binding = [alias, schema];
