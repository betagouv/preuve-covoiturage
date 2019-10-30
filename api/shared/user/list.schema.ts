export const list = {
  $id: 'user.list',
  type: 'object',
  required: ['offset', 'limit'],
  additionalProperties: false,
  properties: {
    offset: {
      type: 'integer',
      maximum: 100000,
      default: 0,
    },
    limit: {
      type: 'integer',
      maximum: 100,
      default: 25,
    },
  },
};

export const alias = list.$id;
