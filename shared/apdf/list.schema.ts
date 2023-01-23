export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['campaign_id'],
  properties: {
    campaign_id: { macro: 'serial' },
    operator_id: { macro: 'serial' },
  },
};

export const alias = 'apdf.list';
export const binding = [alias, schema];
