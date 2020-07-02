export function uuidMacro(): any {
  return {
    type: 'string',
    format: 'uuid',
    minLength: 36,
    maxLength: 36,
    lowercase: true,
    trim: true,
  };
}
