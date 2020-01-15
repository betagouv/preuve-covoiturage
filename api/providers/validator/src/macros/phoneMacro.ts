export function phoneMacro(): { type: string; format: string; minLength: number; maxLength: number } {
  return {
    type: 'string',
    format: 'phone',
    minLength: 10,
    maxLength: 15,
  };
}
