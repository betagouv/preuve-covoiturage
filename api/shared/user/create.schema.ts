export const create = {
  $id: 'user.create',
  type: 'object',
  required: ['email', 'lastname', 'firstname', 'group'],
  additionalProperties: false,
  properties: {
    email: { macro: 'email' },
    lastname: { macro: 'varchar' },
    firstname: { macro: 'varchar' },
    phone: { oneOf: [{ macro: 'phone' }, { type: 'null' }] },
    group: { macro: 'group' },
    role: { macro: 'role' },
    operator_id: { macro: 'dbid' },
    territory_id: { macro: 'dbid' },
  },
  allOf: [
    {
      if: {
        properties: { group: { const: 'territories' } },
      },
      then: {
        required: ['email', 'lastname', 'firstname', 'group', 'territory_id'],
      },
    },
    {
      if: {
        properties: { group: { const: 'operators' } },
      },
      then: {
        required: ['email', 'lastname', 'firstname', 'group', 'operator_id'],
      },
    },
  ],
};

export const alias = create.$id;
