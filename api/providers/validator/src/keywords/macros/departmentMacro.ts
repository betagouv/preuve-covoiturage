export function departmentMacro(): { type: string; format: string; minLength: number; maxLength: number } {
  return {
    type: 'string',
    format: 'department',
    minLength: 2,
    maxLength: 3,
  };
}
