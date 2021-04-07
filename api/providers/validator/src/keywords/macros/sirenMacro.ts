export function sirenMacro(): { type: string; format: string; minLength: number; maxLength: number } {
  return {
    type: 'string',
    format: 'siren',
    minLength: 9,
    maxLength: 9,
  };
}
