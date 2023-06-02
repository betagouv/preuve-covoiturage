import { ceeJourneyTypeEnumSchema, lastNameTruncSchema, phoneTruncSchema, timestampSchema } from './common/ceeSchema';

export const alias = 'cee.importCeeApplication';
export const schema = {
  type: 'array',
  minItems: 1,
  maxItems: 1000,
  items: {
    type: 'object',
    additionalProperties: false,
    required: ['journey_type', 'last_name_trunc', 'phone_trunc', 'datetime'],
    properties: {
      journey_type: ceeJourneyTypeEnumSchema,
      last_name_trunc: lastNameTruncSchema,
      phone_trunc: phoneTruncSchema,
      datetime: timestampSchema,
    },
  },
};
export const binding = [alias, schema];
