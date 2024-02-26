export function base64Macro() {
  return {
    type: 'string',
    minLength: 0,
    maxLength: 2 * 1398104, // 2 Mb
    // 1398104 is the number of chars for 1Mb of base64 data
    pattern: '^(?:[A-Za-z\\d+/]{4})*(?:[A-Za-z\\d+/]{3}=|[A-Za-z\\d+/]{2}==)?$',
    // this pattern validates an empty string too!
  };
}
