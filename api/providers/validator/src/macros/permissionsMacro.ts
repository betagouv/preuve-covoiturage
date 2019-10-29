export function permissionsMacro(schema) {
  return {
    type: 'array',
    items: { type: 'string' },
  };
}
