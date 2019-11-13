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

      // regular string
      {
        type: 'string',
        minLength: 1,
        maxLength: 64,
      },
    ],
  };
}
