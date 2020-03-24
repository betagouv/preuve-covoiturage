export const alias = 'territory.delete';
export const deleteTerritory = {
  $id: alias,
  type: 'object',
  required: ['_id'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'serial' },
  },
};
