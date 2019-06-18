export function siretMacro(schema) {
  return {
    type: 'string',
    format: 'siret',
    minLength: 14,
    maxLength: 14,
  };
}
