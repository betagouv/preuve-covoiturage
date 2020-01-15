export function serialMacro(): { type: string; minimum: number } {
  return {
    type: 'integer',
    minimum: 1,
  };
}
