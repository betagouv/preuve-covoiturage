export const alias = 'acquisition.searcherrors';
export const searcherrors = {
  $id: alias,
  type: 'object',
  required: [],
  additionalProperties: false,
  properties: {
    operator_id: { macro: 'serial' },
    journey_id: { type: 'string' },
    error_code: { type: 'string' },
    start_date: { macro: 'timestamp' },
    end_date: { macro: 'timestamp' },
    error_stage: { type: 'string', enum: ['acquisition', 'normalization', 'fraud'] },
  },
};
