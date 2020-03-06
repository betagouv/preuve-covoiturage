export function dbidMacro(): { anyOf: object[] } {
  return {
    anyOf: [
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
