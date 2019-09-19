export interface TimeFilterInterface {
  time: {
    start: string;
    end: string;
  }[];
}

export const timeFilterSchema = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    required: ['start', 'end'],
    properties: {
      start: {
        type: 'integer',
        minimum: 0,
        maximum: 23,
      },
      end: {
        type: 'integer',
        minimum: 0,
        maximum: 23,
      },
    },
  },
};
