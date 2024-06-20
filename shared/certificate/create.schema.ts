import { findIdentity } from '../common/schemas/findIdentity.ts';

export const alias = 'certificate.create';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['identity', 'tz', 'operator_id'],
  additionalProperties: false,
  properties: {
    operator_id: { macro: 'serial' },
    start_at: { macro: 'timestamp' },
    end_at: { macro: 'timestamp' },
    positions: {
      type: 'array',
      minItems: 2,
      maxItems: 2,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['lon', 'lat'],
        properties: {
          lat: { macro: 'lat' },
          lon: { macro: 'lon' },
        },
      },
    },
    tz: { macro: 'varchar' },
    identity: findIdentity,
  },
};

export const binding = [alias, schema];
