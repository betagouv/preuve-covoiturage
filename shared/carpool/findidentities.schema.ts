import { findIdentity } from '../common/schemas/findIdentity';

export const alias = 'carpool.findidentities';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['identity', 'operator_id'],
  additionalProperties: false,
  properties: {
    identity: findIdentity,
    operator_id: { macro: 'dbid' },
  },
};

export const binding = [alias, schema];
