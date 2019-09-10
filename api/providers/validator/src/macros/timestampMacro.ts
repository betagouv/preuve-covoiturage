export function timestampMacro(schema) {
  return {
    type: 'string',
    format: 'date-time',
    cast: 'date',
  };
}
