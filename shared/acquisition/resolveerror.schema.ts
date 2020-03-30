export const alias = 'acquisition.resolveerror';
export const resolveerror = {
  $id: alias,
  type: 'object',
  required: ['operator_id', 'error_stage', 'journey_id'],
  additionalProperties: false,
  properties: {
    operator_id: { macro: 'serial' },
    journey_id: { type: 'string' },
    error_stage: { type: 'string', enum: ['acquisition', 'normalization', 'fraud'] },
  },
};
