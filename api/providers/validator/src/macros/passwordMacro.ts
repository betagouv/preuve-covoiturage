export function passwordMacro(): { type: string; minLength: number; maxLength: number } {
  return {
    type: 'string',
    minLength: 6,
    maxLength: 256,
  };
}
