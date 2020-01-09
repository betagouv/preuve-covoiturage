export function nafMacro(): { type: string; format: string; minLength: number; maxLength: number } {
  return {
    type: 'string',
    format: 'naf',
    minLength: 5,
    maxLength: 5,
  };
}
