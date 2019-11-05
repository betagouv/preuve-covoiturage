export function dbidMacro(schema) {
  return {
    oneOf: [
      // MongoDB ObjectID
      {
        type: 'string',
        format: 'objectid',
        minLength: 24,
        maxLength: 24,
      },

      // UUID
      {
        type: 'string',
        format: 'uuid',
      },

      // serial integer
      {
        type: 'integer',
        minimum: 1,
      },
    ],
  };
}
