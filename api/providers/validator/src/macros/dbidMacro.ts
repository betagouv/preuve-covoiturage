export function dbidMacro(): { anyOf: object[] } {
  return {
    anyOf: [
      // MongoDB ObjectID
      {
        type: 'string',
        format: 'objectid',
        minLength: 24,
        maxLength: 24,
      },

      // regular string
      {
        type: 'string',
        minLength: 1,
        maxLength: 64,
      },

      // UUID
      {
        type: 'string',
        format: 'uuid',
        maxLength: 38,
      },

      // serial
      {
        type: 'integer',
        minimum: 1,
      },
    ],
  };
}
