export function permissionsMacro() {
  return {
    type: 'array',
    items: {
      type: 'string',
      pattern: '^([a-zA-Z]+\\.?)+$',
      sanitize: true,
      trim: true,
    },
  };
}
