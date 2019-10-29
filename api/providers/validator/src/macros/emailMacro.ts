export function emailMacro(schema) {
  return {
    type: 'string',
    format: 'email',
    minLength: 5,
    maxLength: 256,
  };
}
