export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['territory_id', 'name', 'handler'],
  properties: {
    territory_id: {
      macro: 'serial',
    },
    name: {
      macro: 'varchar',
    },
    months: { macro: 'serial' },
    handler: {
      type: 'string',
      maxLength: 30,
      pattern: '^([A-Za-z0-9-_])*$',
    },
  },
};

export const alias = 'campaign.simulateOnPast';

export const binding = [alias, schema];
