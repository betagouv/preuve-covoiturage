export function tokenMacro(): { type: string; minLength: number; maxLength: number; sanitize: boolean; trim: boolean } {
  return {
    type: 'string',
    minLength: 32,
    maxLength: 64,
    sanitize: true,
    trim: true,
  };
}
