export function longcharMacro(): { type: string; minLength: number; maxLength: number } {
  return {
    type: 'string',
    minLength: 1,
    maxLength: 512,
  };
}
