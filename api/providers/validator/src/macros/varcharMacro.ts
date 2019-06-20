export function varcharMacro(schema) {
  return {
    type: 'string',
    minLength: 1,
    maxLength: 256,
  };
}
