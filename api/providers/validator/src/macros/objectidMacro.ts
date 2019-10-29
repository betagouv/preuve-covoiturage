export function objectidMacro(schema) {
  return {
    type: 'string',
    format: 'objectid',
    minLength: 24,
    maxLength: 24,
  };
}
