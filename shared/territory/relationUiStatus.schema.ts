export const alias = 'territory.getTerritoryRelationUIStatus';

export const schema = {
  $id: alias,
  type: 'object',
  required: ['_id'],
  additionalProperties: false,
  properties: {
    _id: { macro: 'serial' },
  },
};
