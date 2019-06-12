export function nicCustomFormat(data: string): boolean {
  return /^[0-9]{5}$/.test(data);
}
