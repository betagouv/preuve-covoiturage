export function postcodeMacro(schema) {
  return {
    type: 'string',
    format: 'postcode',
    minLength: 5,
    maxLength: 5,
  };
}
