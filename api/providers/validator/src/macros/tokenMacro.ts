export function tokenMacro(schema) {
  return {
    type: 'string',
    minLength: 32,
    maxLength: 64,
  };
}
