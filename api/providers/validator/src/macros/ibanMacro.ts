export function ibanMacro(schema) {
  return {
    type: 'string',
    format: 'iban',
    minLength: 27,
    maxLength: 34,
  };
}
