export const userPatchSchema = {
  $id: 'user.patch',
  type: 'object',
  required: ['id', 'patch'],
  additionalProperties: false,
  properties: {
    id: { macro: 'objectid' },
    patch: {
      type: 'object',
      additionalProperties: false,
      anyOf: [{ required: ['lastname'] }, { required: ['firstname'] }, { required: ['phone'] }],
      properties: {
        lastname: { macro: 'varchar' },
        firstname: { macro: 'varchar' },
        phone: { macro: 'phone' },
      },
    },
  },
};
