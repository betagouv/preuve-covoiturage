export const userListSchema = {
  $id: 'user.list',
  type: 'object',
  additionalProperties: false,
  properties: {
    page: {
      type: 'number',
      maxlength: 128,
    },
    limit: {
      type: 'number',
      maxlength: 128,
    },
  },
};
