export function longcharMacro(schema) {
  return {
    type: 'string',
    minLength: 1,
    maxLength: 512,
  };
}
