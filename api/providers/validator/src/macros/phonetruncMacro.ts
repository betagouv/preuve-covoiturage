export function phonetruncMacro(schema) {
  return {
    type: 'string',
    format: 'phonetrunc',
    minLength: 8,
    maxLength: 15,
  };
}
