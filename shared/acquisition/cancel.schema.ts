export const alias = 'journey.cancel';
export const cancel = {
  $id: alias,
  type: 'object',
  required: ['journey_id'],
  additionalProperties: false,
  properties: {
    journey_id: { macro: 'varchar' },
  },
};
