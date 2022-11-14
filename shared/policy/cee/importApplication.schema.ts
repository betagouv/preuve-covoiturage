import { lastNameTruncSchema, phoneTruncSchema, timestampSchema } from './common/CeeApplicationInterface';

export const alias = 'campaign.importCeeApplication';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['last_name_trunc', 'phone_trunc', 'datetime'],
  properties: {
    last_name_trunc: lastNameTruncSchema,
    phone_trunc: phoneTruncSchema,
    datetime: timestampSchema,
  },
};
export const binding = [alias, schema];
