export const alias = 'campaign.simulateOnPastGeo';

export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['territory_insee', 'policy_template_id'],
  properties: {
    territory_insee: { macro: 'varchar' },
    policy_template_id: { enum: ['1', '2', '3'] },
  },
};

export const binding = [alias, schema];
