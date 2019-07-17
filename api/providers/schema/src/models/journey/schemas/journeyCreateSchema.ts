import { driverSchema, passengerSchema } from '../../person';

export const journeyCreateSchema = {
  $id: 'journey.create',
  type: 'object',
  required: ['journey_id', 'operator_class'],
  anyOf: [{ required: ['passenger'] }, { required: ['driver'] }],
  additionalProperties: false,
  properties: {
    journey_id: { macro: 'varchar' },
    operator_id: { macro: 'objectid' },
    operator_journey_id: { macro: 'varchar' },
    operator_class: { enum: ['A', 'B', 'C'] },
    passenger: passengerSchema,
    driver: driverSchema,
  },
};
