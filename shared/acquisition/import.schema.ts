export const alias = 'journey.import';
export const create = {
  $id: alias,
  type: 'object',
  required: ['data'],
  additionalProperties: false,
  properties: {
    operator_id: { macro: 'serial' },
    data: { type: 'string', maxLength: 1024 * 1024 },
  },
};
