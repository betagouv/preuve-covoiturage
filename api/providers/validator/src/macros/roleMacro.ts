export function roleMacro(schema) {
  return {
    type: 'string',
    enum: ['admin', 'user'],
    default: 'user',
  };
}
