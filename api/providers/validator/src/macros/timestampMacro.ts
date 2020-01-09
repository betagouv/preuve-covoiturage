export function timestampMacro(): { type: string; pattern: string; cast: string } {
  return {
    type: 'string',
    // from https://github.com/epoberezkin/ajv/commit/382c2b9ed151287e4ff0f233d689563f90cd5c20
    // waiting for the release of 6.10.3
    // format: 'date-time',
    // prettier-ignore
    pattern: '^\\d\\d\\d\\d-[0-1]\\d-[0-3]\\d[T\\s](?:[0-2]\\d:[0-5]\\d:[0-5]\\d|23:59:60)(?:\\.\\d+)?(?:Z|[+-]\\d\\d(?::?\\d\\d)?)$',
    cast: 'date',
  };
}
