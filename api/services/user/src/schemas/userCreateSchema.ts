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
    aom: { macro: 'objectid' },
  },
  allOf: [
    {
      if: {
        properties: { group: { const: 'aom' } },
      },
      then: {
        required: ['email', 'lastname', 'firstname', 'group', 'aom'],
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
