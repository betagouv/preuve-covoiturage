export function emailMacro(): { type: string; format: string; minLength: number; maxLength: number } {
  return {
    type: 'string',
    format: 'email',
    minLength: 5,
    maxLength: 256,
  };
}
