export const userChangeRoleSchema = {
  $id: 'user.changeRole',
  type: 'object',
  required: ['_id', 'role'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'objectid' },
    role: { macro: 'role' },
  },
};
