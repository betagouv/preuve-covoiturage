export function passwordMacro(): { type: string; minLength: number; maxLength: number; sanitize: true } {
  return {
    type: 'string',
    minLength: 6,
    maxLength: 256,
  };
}
