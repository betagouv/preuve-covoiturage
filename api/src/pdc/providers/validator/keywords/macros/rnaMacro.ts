export function rnaMacro(): { type: string; format: string; minLength: number; maxLength: number } {
  return {
    type: 'string',
    format: 'rna',
    minLength: 10,
    maxLength: 10,
  };
}
