export function passwordMacro(schema) {
  return {
    type: 'string',
    minLength: 6,
    maxLength: 256,
  };
}
