export const list = {
  $id: 'user.list',
  type: 'object',
  required: [],
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
  },
};

export const alias = list.$id;
