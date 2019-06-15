export const userChangeRoleSchema = {
  $id: 'user.changeRole',
  type: 'object',
  required: ['id', 'role'],
  additionalProperties: false,
  properties: {
    id: {
      type: 'string',
      maxLength: 255,
      minLength: 1,
    },
    role: {
      type: 'string',
      enum: ['admin', 'user'],
    },
  },
};
