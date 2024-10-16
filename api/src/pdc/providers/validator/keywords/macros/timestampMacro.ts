export function timestampMacro() {
  return {
    type: "string",
    format: "date-time",
    cast: "date",
    maxLength: 64,
  };
}
