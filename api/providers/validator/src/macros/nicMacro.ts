export function nicMacro(schema) {
  return {
    type: 'string',
    format: 'nic',
    minLength: 5,
    maxLength: 5,
  };
}
