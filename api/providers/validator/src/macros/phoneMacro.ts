export function phoneMacro(): { type: string; format: string; cast: string; minLength: number; maxLength: number } {
  return {
    type: 'string',
    format: 'phone',
    cast: 'phone',
    minLength: 10,
    maxLength: 20,
  };
}
