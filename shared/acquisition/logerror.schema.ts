export const alias = 'acquisition.logerror';
export const logerror = {
  $id: alias,
  type: 'object',
  required: ['operator_id', 'source', 'auth', 'headers', 'body'],
  additionalProperties: false,
  properties: {
    operator_id: { type: 'number', minimum: 1 },
    source: { type: 'string', enum: ['csv', 'api.v1', 'api.v2'] },
    error_message: { type: 'string', minLength: 0, maxLength: 4096 },
    error_code: { type: 'string', minLength: 0, maxLength: 32 },
    error_line: { type: 'integer', minimum: 1, maximum: 1000000 },
    auth: { type: 'object', additionalProperties: true },
    headers: { type: 'object', additionalProperties: true },
    body: { type: 'object', additionalProperties: true },
  },
};
