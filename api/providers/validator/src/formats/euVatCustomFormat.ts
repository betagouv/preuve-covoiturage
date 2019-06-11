export function euVatCustomFormat(data: string): boolean {
  return /^[A-Z]{2}[A-Z0-9]{2}[0-9]{9}$/.test(data);
}
