export const alias = 'journey.cancel';
export const cancel = {
  $id: alias,
  type: 'object',
  required: ['operator_journey_id'],
  additionalProperties: false,
  properties: {
    operator_journey_id: { macro: 'varchar' },
  },
};
