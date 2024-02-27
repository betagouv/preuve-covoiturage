export function siretMacro(): { type: string; format: string; minLength: number; maxLength: number } {
  return {
    type: 'string',
    format: 'siret',
    minLength: 14,
    maxLength: 14,
  };
}
