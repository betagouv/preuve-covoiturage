export function sirenCustomFormat(data: string): boolean {
  return /^[0-9]{9}$/.test(data);
}
