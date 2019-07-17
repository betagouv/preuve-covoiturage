export const userPatchSchema = {
  $id: 'user.patch',
  type: 'object',
  required: ['_id', 'patch'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'objectid' },
    patch: {
      type: 'object',
      minProperties: 1,
      additionalProperties: false,
      properties: {
        email: { macro: 'email' },
        lastname: { macro: 'varchar' },
        firstname: { macro: 'varchar' },
        phone: { macro: 'phone' },
      },
    },
  },
};
