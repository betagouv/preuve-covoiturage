export function bicMacro(schema) {
  return {
    type: 'string',
    format: 'bic',
    minLength: 8,
    maxLength: 11,
  };
}
