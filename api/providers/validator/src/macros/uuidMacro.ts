export function uuidMacro(): { type: string; format: string } {
  return {
    type: 'string',
    format: 'uuid',
  };
}
