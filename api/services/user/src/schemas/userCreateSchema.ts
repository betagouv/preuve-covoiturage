export const userCreateSchema = {
  $id: 'user.create',
  type: 'object',
  required: ['email', 'lastname', 'firstname', 'group'],
  additionalProperties: false,
  properties: {
    email: { macro: 'email' },
    lastname: { macro: 'varchar' },
    firstname: { macro: 'varchar' },
    phone: { macro: 'phone' },
    group: { macro: 'group' },
    role: { macro: 'role' },
    operator: { macro: 'objectid' },
    territory: { macro: 'objectid' },
  },
  allOf: [
    {
      if: {
        properties: { group: { const: 'territory' } },
      },
      then: {
        required: ['email', 'lastname', 'firstname', 'group', 'territory'],
      },
    },
    {
      if: {
        properties: { group: { const: 'operator' } },
      },
      then: {
        required: ['email', 'lastname', 'firstname', 'group', 'operator'],
      },
    },
  ],
};
