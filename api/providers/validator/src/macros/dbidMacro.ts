export function dbidMacro(): { anyOf: object[] } {
  return {
    anyOf: [
      // regular string
      {
        type: 'string',
        minLength: 1,
        maxLength: 64,
        sanitize: true,
      },

      // UUID
      {
        macro: 'uuid',
      },

      // serial
      {
        type: 'integer',
        minimum: 1,
      },
    ],
  };
}
