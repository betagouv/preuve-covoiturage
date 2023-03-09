export const alias = 'campaign.apply';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['policy_id'],
  properties: {
    policy_id: { macro: 'serial' },
    tz: { macro: 'tz' },
    // do not cast input dates yet
    // it will be properly handled in the action
    // depending on the timezone from the user
    // or the policy
    override_from: {
      type: 'string',
      format: 'date-time',
      maxLength: 64,
    },
    override_until: {
      type: 'string',
      format: 'date-time',
      maxLength: 64,
    },
  },
};

export const binding = [alias, schema];
