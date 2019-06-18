export function rnaMacro(schema) {
  return {
    type: 'string',
    format: 'rna',
    pattern: /W[0-9]{9}/,
    minLength: 10,
    maxLength: 10,
  };
}
