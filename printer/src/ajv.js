const Ajv = require('ajv');

/**
 * Validation schemas
 * - call with ajv.validate(key, payload): boolean
 * - errors are set in ajv.errors: object[]
 */
const schemas = {
  print: {
    $id: 'pdc.print',
    additionalProperties: false,
    required: ['api', 'uuid', 'token'],
    properties: {
      api: {
        type: 'string',
        enum: [...(process.env.APP_ALLOWED_API || 'http://localhost:8080').split(',').map((s) => s.trim())],
      },
      uuid: { type: 'string', format: 'uuid', minLength: 36, maxLength: 36 },
      token: { type: 'string', pattern: '^ey[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+$' },
    },
  },
};

const ajv = new Ajv({ allErrors: true, removeAdditional: 'all' });
Object.keys(schemas).forEach((key) => {
  ajv.addSchema(schemas[key], key);
});

/**
 * Error classes
 */
class ValidationError extends Error {
  constructor(message) {
    if (typeof message !== 'String') {
      message = JSON.stringify(
        message.map((error) => {
          return {
            path: error.dataPath,
            message: error.message,
          };
        }),
      );
    }

    super(message);
    this.name = 'ValidationError';
  }
}

class InvalidParamsError extends ValidationError {
  constructor(message) {
    super(message);
    this.name = 'InvalidParamsError';
  }
}

class InvalidTokenError extends ValidationError {
  constructor(message) {
    super(message);
    this.name = 'InvalidTokenError';
  }
}

module.exports = { ajv, InvalidParamsError, InvalidTokenError };
