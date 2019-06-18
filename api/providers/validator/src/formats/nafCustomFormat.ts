export function nafCustomFormat(data: string): boolean {
  return /^W[0-9]{9}$/.test(data);
}
