export function ibanCast({ data }: { data: string }): string {
  if (!data) {
    throw new Error('Invalid IBAN');
  }

  return data
    .toString()
    .replace(/[^0-9a-z]/gi, '')
    .substr(0, 34)
    .toUpperCase();
}
