export const alias = 'journey.status';
export const status = {
  $id: alias,
  type: 'object',
  required: ['journey_id'],
  additionalProperties: false,
  properties: {
    journey_id: { macro: 'varchar' },
  },
};

export const binding = [alias, status];
