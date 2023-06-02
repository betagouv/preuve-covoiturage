import { ceeApplicationTypeEnumSchema, ceeApplicationUuidSchema, ceeJourneyTypeEnumSchema, identityKeySchema, lastNameTruncSchema, phoneTruncSchema, timestampSchema } from './common/ceeSchema';

export const alias = 'cee.importCeeApplicationIdentity';
export const schema = {
  type: 'array',
  minItems: 1,
  maxItems: 1000,
  items: {
    type: 'object',
    additionalProperties: false,
    anyOf: [
      { required: ['cee_application_type', 'cee_application_uuid', 'identity_key'] },
      { required: ['cee_application_type', 'identity_key', 'phone_trunc', 'last_name_trunc', 'journey_type', 'datetime'] },
    ],
    properties: {
      cee_application_type: ceeApplicationTypeEnumSchema,
      cee_application_uuid: ceeApplicationUuidSchema,
      identity_key: identityKeySchema,
      journey_type: ceeJourneyTypeEnumSchema,
      last_name_trunc: lastNameTruncSchema,
      phone_trunc: phoneTruncSchema,
      datetime: timestampSchema,
    },
  },
};
export const binding = [alias, schema];
