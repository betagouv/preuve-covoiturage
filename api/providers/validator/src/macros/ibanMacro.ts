export function ibanMacro(): { type: string; format: string; minLength: number; maxLength: number } {
  return {
    type: 'string',
    format: 'iban',
    minLength: 27,
    maxLength: 34,
  };
}
