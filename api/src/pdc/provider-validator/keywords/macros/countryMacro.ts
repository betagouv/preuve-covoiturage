export function countryMacro(): { type: string; format: string; minLength: number; maxLength: number } {
  return {
    type: 'string',
    format: 'country',
    minLength: 5,
    maxLength: 5,
  };
}
