export function groupMacro(): { type: string; enum: string[] } {
  return {
    type: 'string',
    enum: ['territories', 'operators', 'registry'],
  };
}
