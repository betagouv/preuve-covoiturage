export function base64Macro() {
  return {
    type: 'string',
    minLength: 0,
    maxLength: 2 * 1398104, // 2 Mb
    // 1398104 is the number of chars for 1Mb of base64 data
  };
}
