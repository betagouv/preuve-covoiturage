import { driverSchema, passengerSchema } from '../../person';

const pSchema = JSON.parse(JSON.stringify(passengerSchema));
const dSchema = JSON.parse(JSON.stringify(driverSchema));

const amountSchema = {
  type: 'integer',
  default: 0,
  minimum: 0,
  maximum: 100000,
};

// convert passenger Schema
pSchema.required = ['identity', 'start', 'end', 'cost', 'contribution'];
pSchema.properties.cost = amountSchema;
pSchema.properties.incentive = amountSchema;
pSchema.properties.remaining_fee = amountSchema;
delete pSchema.properties.incentives;

// convert driver schema
dSchema.required = ['identity', 'start', 'end', 'cost', 'revenue'];
dSchema.properties.incentive = amountSchema;
dSchema.properties.cost = amountSchema;
dSchema.properties.remaining_fee = amountSchema;
delete dSchema.properties.incentives;

export const journeyCreateLegacySchema = {
  $id: 'journey.createLegacy',
  definitions: {
    journey: {
      type: 'object',
      required: ['journey_id', 'operator_class'],
      anyOf: [{ required: ['passenger'] }, { required: ['driver'] }],
      additionalProperties: false,
      properties: {
        journey_id: { macro: 'varchar' },
        operator_id: { macro: 'objectid' },
        operator_journey_id: { macro: 'varchar' },
        operator_class: { enum: ['A', 'B', 'C'] },
        passenger: pSchema,
        driver: dSchema,
      },
    },
  },
  oneOf: [
    {
      $ref: '#/definitions/journey',
    },
    {
      type: 'array',
      items: {
        $ref: '#/definitions/journey',
      },
    },
  ],
};
