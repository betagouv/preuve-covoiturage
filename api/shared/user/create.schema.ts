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
    operator: { macro: 'objectid' },
    territory: { macro: 'objectid' },
  },
  allOf: [
    {
      if: {
        properties: { group: { const: 'territories' } },
      },
      then: {
        required: ['email', 'lastname', 'firstname', 'group', 'territory'],
      },
    },
    {
      if: {
        properties: { group: { const: 'operators' } },
      },
      then: {
        required: ['email', 'lastname', 'firstname', 'group', 'operator'],
      },
    },
  ],
};

export const alias = create.$id;
