export function depMacro(): { type: string; format: string; minLength: number; maxLength: number } {
  return {
    type: 'string',
    format: 'dep',
    minLength: 2,
    maxLength: 3,
  };
}
