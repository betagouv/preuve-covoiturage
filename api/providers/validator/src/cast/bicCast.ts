export function bicCast({ data }: { data: string }) {
  if (!data) {
    throw new Error('Invalid BIC');
  }

  return data
    .toString()
    .replace(/[^0-9a-z]/gi, '')
    .substr(0, 11)
    .toUpperCase();
}
