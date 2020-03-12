export const alias = 'acquisition.summaryerrors';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['group_by'],
  additionalProperties: false,
  properties: {
    operator_id: { macro: 'serial' },
    journey_id: { type: 'string' },
    error_code: { type: 'string' },
    start_date: { macro: 'timestamp' },
    end_date: { macro: 'timestamp' },
    error_stage: { type: 'string', enum: ['acquisition', 'normalization', 'fraud'] },
    group_by: { type: 'string', enum: ['operator_id', 'journey_id', 'error_stage'] },
  },
};

export const binding = [alias, schema];
