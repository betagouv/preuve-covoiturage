import {
  ceeJourneyTypeEnumSchema,
  drivingLicenseSchema,
  identityKeySchema,
  lastNameTruncSchema,
  phoneTruncSchema,
} from './common/ceeSchema.ts';

export const alias = 'cee.simulateCeeApplication';
export const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['last_name_trunc', 'phone_trunc', 'journey_type'],
  properties: {
    last_name_trunc: lastNameTruncSchema,
    phone_trunc: phoneTruncSchema,
    journey_type: ceeJourneyTypeEnumSchema,
    driving_license: drivingLicenseSchema,
    identity_key: identityKeySchema,
  },
};
export const binding = [alias, schema];
