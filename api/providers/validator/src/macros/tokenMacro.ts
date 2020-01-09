export function tokenMacro(): { type: string; minLength: number; maxLength: number } {
  return {
    type: 'string',
    minLength: 32,
    maxLength: 64,
  };
}
