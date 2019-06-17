export const userChangeRoleSchema = {
  $id: 'user.changeRole',
  type: 'object',
  required: ['id', 'role'],
  additionalProperties: false,
  properties: {
    id: {
      type: 'string',
      maxLength: 24,
      minLength: 24,
    },
    role: {
      type: 'string',
      enum: ['admin', 'user'],
    },
  },
};
