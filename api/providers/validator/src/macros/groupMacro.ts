export function groupMacro(schema) {
  return {
    type: 'string',
    enum: ['territories', 'operators', 'registry'],
  };
}
