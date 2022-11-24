export const alias = 'campaign.simulateOnPastGeo';

export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['territory_insee'],
  properties: {
    territory_insee: { macro: 'varchar' },
  },
};

export const binding = [alias, schema];
