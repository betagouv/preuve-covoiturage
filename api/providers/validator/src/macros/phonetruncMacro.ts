export function phonetruncMacro(): { type: string; format: string; minLength: number; maxLength: number } {
  return {
    type: 'string',
    format: 'phonetrunc',
    minLength: 8,
    maxLength: 15,
  };
}
