export function serialMacro(): { type: string; minimum: number; maximum: number } {
  return {
    type: 'integer',
    minimum: 1,
    maximum: 2147483647,
  };
}
