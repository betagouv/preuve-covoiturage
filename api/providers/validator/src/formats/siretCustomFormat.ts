export function siretCustomFormat(data: string): boolean {
  return /^[0-9]{12}$/.test(data);
}
