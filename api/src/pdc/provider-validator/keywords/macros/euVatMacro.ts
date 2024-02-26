export function euVatMacro(): { type: string; format: string; minLength: number; maxLength: number } {
  return {
    type: 'string',
    format: 'euvat',
    minLength: 13,
    maxLength: 13,
  };
}
