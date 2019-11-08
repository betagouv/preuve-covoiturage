export function dbidMacro(schema) {
  return {
    type: 'string',
    minLength: 1,
    maxLength: 64,
  };

  // return {
  //   oneOf: [
  //     // MongoDB ObjectID
  //     {
  //       type: 'string',
  //       format: 'objectid',
  //       minLength: 24,
  //       maxLength: 24,
  //     },

  //     // UUID
  //     {
  //       type: 'string',
  //       format: 'uuid',
  //     },

  //     // serial integer
  //     {
  //       type: 'integer',
  //       minimum: 1,
  //     },
  //   ],
  // };
}
