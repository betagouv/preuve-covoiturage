export function siretCustomFormat(data: string): boolean {
  return /^[0-9]{14}$/.test(data);
}
