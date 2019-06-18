export function groupMacro(schema) {
  return {
    type: 'string',
    enum: ['aom', 'operators', 'registry'],
  };
}
