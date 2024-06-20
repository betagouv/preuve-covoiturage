import { distanceSchema, incentivesSchema } from './common/schemas/createJourneyCommon';
import { timeGeoPointSchema } from './common/schemas/createJourneySchemaV3';

export const alias = 'journey.patch';
export const schema = {
  type: 'object',
  required: ['operator_journey_id', 'incentives', 'operator_class', 'start', 'end', 'distance'],
  additionalProperties: false,
  properties: {
    operator_id: { macro: 'serial' },
    operator_journey_id: { macro: 'varchar' },
    operator_trip_id: { macro: 'varchar' },
    operator_class: { enum: ['A', 'B', 'C'] },
    start: timeGeoPointSchema,
    end: timeGeoPointSchema,
    distance: distanceSchema,
    incentives: incentivesSchema,
    incentive_counterparts: {},
  },
};

export const binding = [alias, schema];
