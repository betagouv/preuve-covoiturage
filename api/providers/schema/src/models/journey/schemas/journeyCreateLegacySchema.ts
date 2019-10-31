// import { driverSchema, passengerSchema } from '../../person';

// const pSchema = JSON.parse(JSON.stringify(passengerSchema));
// const dSchema = JSON.parse(JSON.stringify(driverSchema));

// const amountSchema = {
//   type: 'integer',
//   default: 0,
//   minimum: 0,
//   maximum: 100000,
// };

// // convert passenger Schema
// pSchema.required = ['identity', 'start', 'end', 'cost', 'contribution'];
// pSchema.properties.cost = amountSchema;
// pSchema.properties.incentive = amountSchema;
// pSchema.properties.remaining_fee = amountSchema;
// pSchema.properties.travel_pass = { oneOf: [pSchema.properties.identity.properties.travel_pass, { type: 'null' }] };
// delete pSchema.properties.identity.properties.travel_pass;
// delete pSchema.properties.incentives;

// // convert driver schema
// dSchema.required = ['identity', 'start', 'end', 'cost', 'revenue'];
// dSchema.properties.incentive = amountSchema;
// dSchema.properties.cost = amountSchema;
// dSchema.properties.remaining_fee = amountSchema;
// delete dSchema.properties.incentives;

// export const journeyCreateLegacySchema = {
//   $id: 'journey.createLegacy',
//   definitions: {
//     journey: {
//       type: 'object',
//       required: ['journey_id', 'operator_class'],
//       anyOf: [{ required: ['passenger'] }, { required: ['driver'] }],
//       additionalProperties: false,
//       properties: {
//         journey_id: { macro: 'varchar' },
//         operator_id: { macro: 'objectid' },
//         operator_journey_id: { macro: 'varchar' },
//         operator_class: { enum: ['A', 'B', 'C'] },
//         passenger: pSchema,
//         driver: dSchema,
//       },
//     },
//   },
//   oneOf: [
//     {
//       $ref: '#/definitions/journey',
//     },
//     {
//       type: 'array',
//       items: {
//         $ref: '#/definitions/journey',
//       },
//     },
//   ],
// };

export const journeyCreateLegacySchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Registre de preuve de covoiturage - Journey Schema V1',
  $id: 'journey.createLegacy',
  definitions: {
    travelpass: {
      type: 'object',
      minProperties: 2,
      additionalProperties: false,
      properties: {
        name: {
          enum: ['navigo'],
        },
        user_id: { macro: 'varchar' },
      },
    },
    identity: {
      type: 'object',
      required: ['phone'],
      additionalProperties: false,
      properties: {
        firstname: { macro: 'varchar' },
        lastname: { macro: 'varchar' },
        email: { macro: 'email' },
        phone: { macro: 'phone' },
        company: { macro: 'varchar' },
        over_18: {
          enum: [true, false, null],
          default: null,
        },
      },
    },
    position: {
      type: 'object',
      required: ['datetime'],
      additionalProperties: false,
      minProperties: 2,
      dependencies: {
        lat: ['lon'],
        lon: ['lat'],
        country: ['literal'],
      },
      properties: {
        datetime: { macro: 'timestamp' },
        lat: { macro: 'lat' },
        lon: { macro: 'lon' },
        insee: { macro: 'insee' },
        town: { macro: 'varchar' },
        country: { macro: 'varchar' },
        literal: { macro: 'longchar' },
      },
    },
    payment: {
      type: 'object',
      required: ['pass', 'amount'],
      additionalProperties: false,
      properties: {
        pass: { macro: 'siret' },
        amount: {
          type: 'integer',
          minimum: 0,
          maximum: 100000,
        },
      },
    },
    passenger: {
      type: 'object',
      required: ['identity', 'start', 'end'],
      additionalProperties: false,
      properties: {
        identity: { $ref: '#/definitions/identity' },
        start: { $ref: '#/definitions/position' },
        end: { $ref: '#/definitions/position' },
        seats: {
          type: 'integer',
          default: 1,
          minimum: 1,
          maximum: 8,
        },
        cost: {
          type: 'integer',
          minimum: 0,
          maximum: 1000000,
        },
        contribution: {
          type: 'integer',
          minimum: 0,
          maximum: 1000000,
          $comment: "Montant en centimes d'Euros après que toutes les incitations aient été attribuées",
        },
        incentive: {
          type: 'integer',
          minimum: 0,
          maximum: 1000000,
          $comment: "Incitation en centimes d'Euros",
        },
        payments: {
          type: 'array',
          minItems: 0,
          items: { $ref: '#/definitions/payment' },
        },
        distance: {
          type: 'integer',
          minimum: 0,
          maximum: 1000000,
        },
        duration: {
          type: 'integer',
          minimum: 0,
          maximum: 86400,
        },
        travel_pass: { oneOf: [{ $ref: '#/definitions/travelpass' }, { type: 'null' }] },
      },
    },
    driver: {
      type: 'object',
      required: ['identity', 'start', 'end', 'revenue'],
      additionalProperties: false,
      properties: {
        identity: { $ref: '#/definitions/identity' },
        start: { $ref: '#/definitions/position' },
        end: { $ref: '#/definitions/position' },
        cost: {
          type: 'integer',
          minimum: 0,
          maximum: 1000000,
        },
        revenue: {
          type: 'integer',
          minimum: 0,
          maximum: 1000000,
          $comment:
            "Montant perçu en centimes d'Euros après que toutes les incitations et contributions des passagers aient été attribuées",
        },
        payments: {
          type: 'array',
          minItems: 0,
          items: { $ref: '#/definitions/payment' },
        },
        distance: {
          type: 'integer',
          minimum: 0,
          maximum: 1000000,
        },
        duration: {
          type: 'integer',
          minimum: 0,
          maximum: 86400,
        },
      },
    },
  },
  type: 'object',
  required: ['journey_id', 'operator_class'],
  anyOf: [{ required: ['passenger'] }, { required: ['driver'] }],
  additionalProperties: false,
  properties: {
    journey_id: { macro: 'varchar' },
    operator_journey_id: { macro: 'varchar' },
    operator_class: { enum: ['A', 'B', 'C'] },
    passenger: { $ref: '#/definitions/passenger' },
    driver: { $ref: '#/definitions/driver' },
  },
};
