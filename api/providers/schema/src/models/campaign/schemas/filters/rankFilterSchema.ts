export const rankFilterSchema = {
  type: 'array',
  items: {
    type: 'string',
    enum: ['A', 'B', 'C'],
  },
};
