export const list = {
  $id: 'user.list',
  type: 'object',
  required: ['offset', 'limit'],
  additionalProperties: false,
  properties: {
    offset: {
      type: 'integer',
      minimum: 0,
      maximum: 100000,
      default: 0,
    },
    limit: {
      type: 'integer',
      minimum: 1,
      maximum: 10000,
      default: 25,
    },
  },
};

export const alias = list.$id;
