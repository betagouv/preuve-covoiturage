export const alias = 'campaign.finalize';
export const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    from: { macro: 'timestamp' },
    to: { macro: 'timestamp' },
    tz: { macro: 'tz' },
    sync_incentive_sum: { type: 'boolean' },
    clear: { type: 'boolean' },
  },
};

export const binding = [alias, schema];
