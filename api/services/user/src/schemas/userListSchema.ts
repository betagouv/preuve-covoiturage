export const userListSchema = {
  $id: 'user.list',
  type: 'object',
  additionalProperties: false,
  properties: {
    page: {
      type: 'number',
      maxLength: 128,
    },
    limit: {
      type: 'number',
      maxLength: 128,
    },
  },
};
