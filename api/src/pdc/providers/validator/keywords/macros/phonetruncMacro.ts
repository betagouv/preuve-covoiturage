export function phonetruncMacro(): {
  type: string;
  format: string;
  cast: string;
  minLength: number;
  maxLength: number;
} {
  return {
    type: 'string',
    format: 'phonetrunc',
    cast: 'phonetrunc',
    minLength: 8,
    maxLength: 20,
  };
}
