export function currency(str: string): string {
  return String((Number(str) || 0).toFixed(2)).replace('.', ',');
}
