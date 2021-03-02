export function timestampMacro() {
  return {
    oneOf: [
      {
        type: 'string',
        format: 'date-time',
        cast: 'date',
      },
      {
        instanceof: 'Date',
      },
    ],
  };
}
