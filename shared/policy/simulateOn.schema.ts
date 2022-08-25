import { schema as policySchema } from './common/schemas/policy';

export const alias = 'campaign.simulateOn';

export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['policy'],
  properties: {
    policy: policySchema,
  },
};

export const binding = [alias, schema];
