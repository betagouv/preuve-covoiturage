export function jwtMacro(): any {
  return {
    type: 'string',
    pattern: '^ey[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+$',
    minLength: 32,
    maxLength: 512,
    trim: true,
  };
}
