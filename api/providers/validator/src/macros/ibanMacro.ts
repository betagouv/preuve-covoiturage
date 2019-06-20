export function ibanMacro(schema) {
  return {
    type: 'string',
    format: 'iban',
    minLength: 18,
    maxLength: 18,
  };
}
