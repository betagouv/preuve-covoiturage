export function bicMacro(): { type: string; format: string; minLength: number; maxLength: number } {
  return {
    type: 'string',
    format: 'bic',
    minLength: 8,
    maxLength: 11,
  };
}
