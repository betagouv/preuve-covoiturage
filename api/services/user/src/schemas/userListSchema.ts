export const userListSchema = {
  $id: 'user.list',
  type: 'object',
  additionalProperties: false,
  properties: {
    page: {
      type: 'integer',
      maximum: 100,
    },
    limit: {
      type: 'integer',
      maximum: 10000,
    },
    aom: {
      type: 'string', // objectid
      maxLength: 255,
    },
    operator: {
      type: 'string', // objectid
      maxLength: 255,
    },
  },
};
