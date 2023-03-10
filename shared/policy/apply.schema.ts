export const alias = 'campaign.apply';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['policy_id'],
  properties: {
    policy_id: { macro: 'serial' },
    from: { macro: 'timestamp' },
    to: { macro: 'timestamp' },
    tz: { macro: 'tz' },
    finalize: { type: 'boolean' },
    override: { type: 'boolean' },
  },
};

export const binding = [alias, schema];
