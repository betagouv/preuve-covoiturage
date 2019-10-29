export function sirenMacro(schema) {
  return {
    type: 'string',
    format: 'siren',
    minLength: 9,
    maxLength: 9,
  };
}
