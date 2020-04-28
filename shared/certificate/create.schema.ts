export const alias = 'certificate.create';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['identity', 'operator_id', 'territory_id'],
  additionalProperties: false,
  properties: {
    start_at: { macro: 'timestamp' },
    end_at: { macro: 'timestamp' },
    operator_id: { macro: 'number' },
    territory_id: { macro: 'number' },
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
