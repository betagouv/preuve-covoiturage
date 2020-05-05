export const position = {
  type: 'object',
  additionalProperties: false,
  minProperties: 2,
  properties: {
    lat: { macro: 'lat' },
    lon: { macro: 'lon' },
  },
};

export const alias = 'certificate.create';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['identity', 'tz', 'operator_id'],
  additionalProperties: false,
  properties: {
    operator_id: { macro: 'number' },
    start_at: { macro: 'timestamp' },
    end_at: { macro: 'timestamp' },
    start_pos: position,
    end_pos: position,
    tz: { macro: 'varchar' },
    identity: {
      anyOf: [
        { _id: { macro: 'serial' } },
        { uuid: { macro: 'uuid' } },
        { phone: { macro: 'phone' } },
        { phone_trunc: { macro: 'phonetrunc' }, operator_user_id: { macro: 'varchar' } },
      ],
    },
  },
};

export const binding = [alias, schema];
