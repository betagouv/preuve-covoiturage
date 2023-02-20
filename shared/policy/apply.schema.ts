export const alias = 'campaign.apply';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['policy_id'],
  properties: {
    policy_id: { macro: 'serial' },
    override_from: { macro: 'timestamp' },
    override_until: { macro: 'timestamp' },
  },
};

export const binding = [alias, schema];
