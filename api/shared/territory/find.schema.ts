export const alias = 'territory.find';
export const find = {
  $id: alias,
  type: 'object',
  required: ['_id'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'dbid' },
  },
};
