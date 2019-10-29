export function nafMacro(schema) {
  return {
    type: 'string',
    format: 'naf',
    minLength: 5,
    maxLength: 5,
  };
}
