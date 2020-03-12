export const patch = {
  $id: 'user.patch',
  type: 'object',
  required: ['_id', 'patch'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'serial' },
    patch: {
      type: 'object',
      minProperties: 1,
      additionalProperties: false,
      properties: {
        email: { macro: 'email' },
        lastname: { macro: 'varchar' },
        firstname: { macro: 'varchar' },
        role: { macro: 'varchar' },
        phone: { oneOf: [{ macro: 'phone' }, { type: 'null' }] },
      },
    },
  },
};

export const alias = patch.$id;
