export function emailCast({ data }: { data: string }): string {
  if (!data) {
    throw new Error('Invalid email');
  }

  return data
    .toString()
    .replace(/[^0-9a-z@.-_]/gi, '')
    .toLowerCase();
}
