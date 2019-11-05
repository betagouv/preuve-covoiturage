export const register = {
  $id: 'user.register',
  type: 'object',
  required: ['email', 'lastname', 'firstname', 'group', 'password'],
  additionalProperties: false,
  properties: {
    email: { macro: 'email' },
    lastname: { macro: 'varchar' },
    firstname: { macro: 'varchar' },
    phone: { macro: 'phone' },
    group: { macro: 'group' },
    role: { macro: 'role' },
    operator: { macro: 'dbid' },
    territory: { macro: 'dbid' },
    password: { macro: 'password' },
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

export const alias = register.$id;
