export const alias = 'certificate.create';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['identity'],
  additionalProperties: false,
  properties: {
    start_at: { macro: 'timestamp' },
    end_at: { macro: 'timestamp' },
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
