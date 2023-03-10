export const alias = 'campaign.syncmaxamount';
export const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    campaigns: {
      type: 'array',
      items: { macro: 'serial' },
      minItems: 1,
      maxItems: 256,
    },
  },
};

export const binding = [alias, schema];
