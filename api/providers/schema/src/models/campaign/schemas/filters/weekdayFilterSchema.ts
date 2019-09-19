export const weekdayFilterSchema = {
  type: 'array',
  items: {
    type: 'integer',
    minimum: 0,
    maximum: 6,
  },
};
