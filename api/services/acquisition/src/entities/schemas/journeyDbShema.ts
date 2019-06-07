const IdentityPropertiesSchema =  {
  firstname: {
    bsonType: 'string',
    maxLength: 128,
  },
  lastname: {
    bsonType: 'string',
    maxLength: 128,
  },
  email: {
    bsonType: 'string',
    maxLength: 128,
  },
  phone: {
    bsonType: 'string',
    maxLength: 32,
  },
  company: {
    bsonType: 'string',
    maxLength: 128,
  },
  travel_pass: {
    bsonType: 'object',
    required: ['name', 'user_id'],
    additionalProperties: false,
    properties: {
      name: {
        bsonType: 'string',
        minlength: 2,
        maxLength: 128,
      },
      user_id: {
        bsonType: 'string',
        minlength: 2,
        maxLength: 64,
      },
    },
  },
};

const startOrEndSchema = {
  bsonType: 'object',
  required: ['datetime'],
  minProperties: 2,
  dependencies: {
    lat: ['lon'],
    lon: ['lat'],
  },
  additionalProperties: false,
  properties: {
    datetime: {
      bsonType: 'date'
    },
    lon: {
      bsonType: 'double',
      minimum: -180,
      maximum: 180,
    },
    lat: {
      bsonType: 'double',
      minimum: -180,
      maximum: 180,
    },
    insee: {
      bsonType: 'string',
      maxLength: 128,      
    },
    literal: {
      bsonType: 'string',
      maxLength: 512,
    },
    // aom,
    // town: { type: String, trim: true },
    // country: { type: String, trim: true },
    // postcodes: [{
    //   type: String,
    //   trim: true,
    //   uppercase: true,
    //   match: regex.postcode,
    // }],
  }
}

const driverOrPassengerCommonProperties = {
  start: startOrEndSchema,
  end: startOrEndSchema,
  distance: {
    bsonType: 'int', 
    minimum: 0,
    maximum: 1000000,
  },
  duration: {
    bsonType: 'int', 
    minimum: 0,
    maximum: 100000,
  },
  cost: {
    bsonType: 'int', 
    minimum: 0,
    maximum: 100000,
  },
  incentive: {
    bsonType: 'int', 
    minimum: 0,
    maximum: 100000,
  },
  remaining_fee: {
    bsonType: 'int', 
    minimum: 0,
    maximum: 100000,
  },
};

const driverSchema = {
  bsonType: 'object',
  required: ['identity', 'start', 'end', 'revenue', 'cost'],
  additionalProperties: false,
  properties: {
    ...driverOrPassengerCommonProperties,
    identity: {
      bsonType: 'object',
      required: ['phone'],
      additionalProperties: false,
      properties: {
        ...IdentityPropertiesSchema,
      }
    },
    revenue: {
      bsonType: 'int',
      minimum: 0,
      maximum: 100000,
    },
    expense: {
      bsonType: 'int',
      minimum: 0,
      maximum: 100000,
    },
  },
};

const passengerSchema = {
  bsonType: 'object',
  required: ['identity', 'start', 'end', 'contribution', 'cost', 'seats'],
  additionalProperties: false,
  properties: {
    ...driverOrPassengerCommonProperties,
    identity: {
      bsonType: 'object',
      required: ['phone'],
      additionalProperties: false,
      properties: {
        ...IdentityPropertiesSchema,
        over_18: {
          bsonType: 'boolean',
        },
      }
    },
    contribution: {
      bsonType: 'int',
      minimum: 0,
      maximum: 100000,
    },
    seats: {
      bsonType: 'int',
      minimum: 1,
      maximum: 8
    },
  },
};

export const journeyDbSchema = {
  bsonType: 'object',
  required: [''],
  additionalProperties: false,
  properties: {
    journey_id: { // unique
      bsonType: 'string',
      maxLength: 128,
    },
    operator_journey_id: { // unique
      bsonType: 'string',
      maxLength: 128,
    },
    operator_class: {
      bsonType: 'string',
      maxLength: 1,
    },
    operator: {
      bsonType: 'object',
      required: ['_id', 'name'],
      additionalProperties: false,
      properties: {
        _id: {
          bsonType: 'objectId',
        },
        name: {
          bsonType: 'string',
          maxLength: 128,
        },
      }
    },
    passenger: passengerSchema,
    driver: driverSchema,
  },
};
