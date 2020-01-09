export function permissionsMacro(): { type: string; items: { type: string } } {
  return {
    type: 'array',
    items: { type: 'string' },
  };
}
