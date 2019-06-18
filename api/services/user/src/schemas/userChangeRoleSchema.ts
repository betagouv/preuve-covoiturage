export const userChangeRoleSchema = {
  $id: 'user.changeRole',
  type: 'object',
  required: ['id', 'role'],
  additionalProperties: false,
  properties: {
    id: { macro: 'objectid' },
    role: { macro: 'role' },
  },
};
