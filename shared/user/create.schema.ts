export const create = {
  $id: 'user.create',
  type: 'object',
  required: ['email', 'lastname', 'firstname', 'role'],
  additionalProperties: false,
  properties: {
    email: { macro: 'email' },
    lastname: { macro: 'varchar' },
    firstname: { macro: 'varchar' },
    phone: { oneOf: [{ macro: 'phone' }, { type: 'null' }] },
    group: { macro: 'group' },
    role: { macro: 'role' },
    operator_id: { macro: 'serial' },
    territory_id: { macro: 'serial' },
  },
  allOf: [
    {
      if: {
        properties: { role: { enum: ['territory.admin', 'territory.user'] } },
      },
      then: {
        required: ['email', 'lastname', 'firstname', 'role', 'territory_id'],
      },
    },
    {
      if: {
        properties: { role: { enum: ['operator.admin', 'operator.user'] } },
      },
      then: {
        required: ['email', 'lastname', 'firstname', 'role', 'operator_id'],
      },
    },
  ],
};

export const alias = create.$id;
