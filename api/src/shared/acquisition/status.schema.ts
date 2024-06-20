export const alias = 'journey.status';
export const status = {
  $id: alias,
  type: 'object',
  required: ['operator_journey_id'],
  additionalProperties: false,
  properties: {
    operator_journey_id: { macro: 'varchar' },
  },
};

export const binding = [alias, status];
