import {
  drivingLicenseSchema,
  lastNameTruncSchema,
  operatorJourneyIdSchema,
  phoneTruncSchema,
} from './common/ceeSchema';

export const alias = 'campaign.registerCeeApplication';
export const schema = {
  oneOf: [
    {
      type: 'object',
      additionalProperties: false,
      required: ['journey_type', 'driving_license', 'last_name_trunc', 'phone_trunc'],
      properties: {
        journey_type: {
          type: 'string',
          enum: ['long'],
        },
        driving_license: drivingLicenseSchema,
        last_name_trunc: lastNameTruncSchema,
        phone_trunc: phoneTruncSchema,
      },
    },
    {
      type: 'object',
      additionalProperties: false,
      required: ['journey_type', 'driving_license', 'last_name_trunc', 'operator_journey_id'],
      properties: {
        journey_type: {
          type: 'string',
          enum: ['short'],
        },
        driving_license: drivingLicenseSchema,
        last_name_trunc: lastNameTruncSchema,
        operator_journey_id: operatorJourneyIdSchema,
      },
    },
  ],
};
export const binding = [alias, schema];
