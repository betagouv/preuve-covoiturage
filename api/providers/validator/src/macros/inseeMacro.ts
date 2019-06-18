export function inseeMacro(schema) {
  return {
    type: 'string',
    format: 'insee',
    minLength: 5,
    maxLength: 5,
  };
}
