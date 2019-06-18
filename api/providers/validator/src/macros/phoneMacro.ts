export function phoneMacro(schema) {
  return {
    type: 'string',
    format: 'phone',
    minLength: 10,
    maxLength: 15,
  };
}
