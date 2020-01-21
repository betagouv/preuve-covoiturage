export function roleMacro(): { type: string; enum: string[]; default: string } {
  return {
    type: 'string',
    enum: ['operator.admin', 'operator.user', 'registry.admin', 'registry.user', 'territory.admin', 'territory.user'],
    default: 'user',
  };
}
