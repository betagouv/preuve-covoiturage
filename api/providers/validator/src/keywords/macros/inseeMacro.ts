export function inseeMacro(): { type: string; format: string; minLength: number; maxLength: number } {
  return {
    type: 'string',
    format: 'insee',
    minLength: 5,
    maxLength: 5,
  };
}
