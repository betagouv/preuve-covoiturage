const startOrEndSchema = {
  type: 'object',
  required: ['datetime'],
  additionalProperties: false,
  minProperties: 2,
  dependencies: {
    lat: ['lon'],
    lon: ['lat'],
  },
  properties: {
    datetime: {
      type: 'string',
      format: 'date-time',
    },
    lat: {
      type: 'number',
      minimum: -180,
      maximum: 180,
    },
    lon: {
      type: 'number',
      minimum: -180,
      maximum: 180,
    },
    insee: {
      type: 'string',
      maxLength: 128,
    },
    literal: {
      type: 'string',
      maxLength: 512,
    },
  },
};

const identityProperties = {
  firstname: {
    type: 'string',
    maxLength: 128,
  },
  lastname: {
    type: 'string',
    maxLength: 128,
  },
  email: {
    type: 'string',
    format: 'email',
    maxLength: 128,
  },
  phone: {
    type: 'string',
    format: 'phone',
    maxLength: 32,
  },
  company: {
    type: 'string',
    maxLength: 128,
  },
  travel_pass: {
    type: 'object',
    required: ['name', 'user_id'],
    additionalProperties: false,
    properties: {
      name: {
        type: 'string',
        minlength: 2,
        maxLength: 128,
      },
      user_id: {
        type: 'string',
        minlength: 2,
        maxLength: 64,
      },
    },
  },
};

export const journeyDbSchema = {
  $id: 'journey.create',
  type: 'object',
  required: ['journey_id', 'operator_class'],
  additionalProperties: false,
  properties: {
    journey_id: {
      type: 'string',
      maxLength: 128,
    },
    operator_journey_id: {
      type: 'string',
      maxLength: 128,
    },
    operator_class: {
      type: 'string',
      maxLength: 1,
      enum: ['A', 'B', 'C', 'Z'],
    },
    passenger: {
      type: 'object',
      required: ['identity', 'start', 'end', 'seats', 'contribution'],
      additionalProperties: false,
      properties: {
        identity: {
          type: 'object',
          required: ['phone'],
          additionalProperties: false,
          properties: {
            ...identityProperties,
            over_18: {
              type: 'boolean',
            },
          },
        },
        start: startOrEndSchema,
        end: startOrEndSchema,
        seats: {
          type: 'integer',
          default: 1,
          minimum: 1,
          maximum: 8,
        },
        contribution: {
          type: 'integer',
          minimum: 0,
          maximum: 100000,
        },
        distance: {
          type: 'integer',
          minimum: 0,
          maximum: 1000000,
        },
        duration: {
          type: 'integer',
          minimum: 0,
          maximum: 100000,
        },
      },
    },
    driver: {
      type: 'object',
      required: ['identity', 'start', 'end', 'revenue'],
      additionalProperties: false,
      properties: {
        identity: {
          type: 'object',
          required: ['phone'],
          additionalProperties: false,
          properties: {
            ...identityProperties,
          },
        },
        start: startOrEndSchema,
        end: startOrEndSchema,
        revenue: {
          type: 'integer',
          minimum: 0,
          maximum: 100000,
        },
        distance: {
          type: 'integer',
          minimum: 0,
          maximum: 1000000,
        },
        duration: {
          type: 'integer',
          minimum: 0,
          maximum: 100000,
        },
      },
    },
  },
};
