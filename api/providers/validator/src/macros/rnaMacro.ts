export function rnaMacro(schema) {
  return {
    type: 'string',
    format: 'rna',
    minLength: 10,
    maxLength: 10,
  };
}
