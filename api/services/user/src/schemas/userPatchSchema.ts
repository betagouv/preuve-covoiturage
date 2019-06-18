export const userPatchSchema = {
  $id: 'user.patch',
  type: 'object',
  required: ['id', 'patch'],
  additionalProperties: false,
  properties: {
    id: { macro: 'objectid' },
    patch: {
      type: 'object',
      minProperties: 1,
      additionalProperties: false,
      properties: {
        lastname: { macro: 'varchar' },
        firstname: { macro: 'varchar' },
        phone: { macro: 'phone' },
      },
    },
  },
};
