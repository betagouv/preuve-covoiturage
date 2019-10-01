export const territoryFindSchema = {
  $id: 'territory.find',
  type: 'object',
  required: ['_id'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'objectid' },
  },
};
