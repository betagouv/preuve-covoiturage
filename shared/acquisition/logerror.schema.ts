export const alias = 'acquisition.logerror';
export const logerror = {
  $id: alias,
  type: 'object',
  required: ['operator_id', 'source', 'auth', 'headers', 'body', 'error_stage', 'journey_id'],
  additionalProperties: false,
  properties: {
    operator_id: { macro: 'serial' },
    journey_id: { type: 'string' },
    source: { type: 'string', enum: ['csv', 'api.v1', 'api.v2'] },
    error_stage: { type: 'string', enum: ['acquisition', 'normalisation', 'fraud'] },
    error_message: { oneOf: [{ type: 'null' }, { type: 'string', minLength: 0, maxLength: 4096 }] },
    error_code: { oneOf: [{ type: 'null' }, { type: 'string', minLength: 0, maxLength: 32 }] },
    error_line: { oneOf: [{ type: 'null' }, { type: 'integer', minimum: 1, maximum: 1000000 }] },
    error_attempt: { type: 'integer' },
    auth: { type: 'object', additionalProperties: true },
    headers: { type: 'object', additionalProperties: true },
    body: { type: 'object', additionalProperties: true },
  },
};
