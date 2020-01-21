export function postcodeMacro(): { type: string; format: string; minLength: number; maxLength: number } {
  return {
    type: 'string',
    format: 'postcode',
    minLength: 5,
    maxLength: 5,
  };
}
