import { driverSchema, passengerSchema } from './common/schemas/person';

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
pSchema.properties.travel_pass = { oneOf: [pSchema.properties.identity.properties.travel_pass, { type: 'null' }] };
delete pSchema.properties.identity.properties.travel_pass;
delete pSchema.properties.incentives;
delete pSchema.properties.payments;

// convert driver schema
dSchema.required = ['identity', 'start', 'end', 'cost', 'revenue'];
dSchema.properties.incentive = amountSchema;
dSchema.properties.cost = amountSchema;
dSchema.properties.remaining_fee = amountSchema;
delete dSchema.properties.incentives;
delete dSchema.properties.payments;

export const alias = 'journey.createLegacy';
export const schema = {
  $id: alias,
  type: 'object',
  required: ['journey_id', 'operator_class'],
  anyOf: [{ required: ['passenger'] }, { required: ['driver'] }],
  additionalProperties: false,
  properties: {
    journey_id: { macro: 'varchar' },
    operator_id: { macro: 'serial' },
    operator_journey_id: { macro: 'varchar' },
    operator_class: { enum: ['A', 'B', 'C'] },
    passenger: pSchema,
    driver: dSchema,
  },
};

export const binding = [alias, schema];
