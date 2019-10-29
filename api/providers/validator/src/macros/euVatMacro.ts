export function euVatMacro(schema) {
  return {
    type: 'string',
    format: 'euvat',
    minLength: 13,
    maxLength: 13,
  };
}
