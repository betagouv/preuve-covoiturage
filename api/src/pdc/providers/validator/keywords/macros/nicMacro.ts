export function nicMacro(): { type: string; format: string; minLength: number; maxLength: number } {
  return {
    type: 'string',
    format: 'nic',
    minLength: 5,
    maxLength: 5,
  };
}
