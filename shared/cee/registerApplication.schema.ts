import {
  ceeJourneyTypeEnumSchema,
  drivingLicenseSchema,
  identityKeySchema,
  lastNameTruncSchema,
  operatorJourneyIdSchema,
  phoneTruncSchema,
  timestampSchema,
} from './common/ceeSchema';

export const alias = 'cee.registerCeeApplication';
export const schema = {
  allOf: [
    {
      type: 'object',
      required: ['journey_type', 'driving_license', 'last_name_trunc', 'application_timestamp'],
      properties: {
        application_timestamp: timestampSchema,
        journey_type: ceeJourneyTypeEnumSchema,
        driving_license: drivingLicenseSchema,
        last_name_trunc: lastNameTruncSchema,
        identity_key: identityKeySchema,
      },
    },
    {
      if: {
        type: 'object',
        required: ['journey_type'],
        properties: {
          journey_type: {
            const: 'long',
          },
        },
      },
      then: {
        type: 'object',
        additionalProperties: false,
        required: ['journey_type', 'driving_license', 'last_name_trunc', 'datetime', 'phone_trunc'],
        properties: {
          application_timestamp: {},
          journey_type: {},
          driving_license: {},
          last_name_trunc: {},
          identity_key: {},
          phone_trunc: phoneTruncSchema,
          datetime: timestampSchema,
        },
      },
    },
    {
      if: {
        type: 'object',
        required: ['journey_type'],
        properties: {
          journey_type: {
            const: 'short',
          },
        },
      },
      then: {
        type: 'object',
        additionalProperties: false,
        required: ['journey_type', 'driving_license', 'last_name_trunc', 'operator_journey_id'],
        properties: {
          application_timestamp: {},
          journey_type: {},
          driving_license: {},
          last_name_trunc: {},
          identity_key: {},
          operator_journey_id: operatorJourneyIdSchema,
        },
      },
    },
  ],
};

export const binding = [alias, schema];
