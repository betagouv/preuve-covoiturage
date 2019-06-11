export function dateCast({ data }: { data: string | number | Date }) {
  if (!data) {
    throw new Error('Invalid Date');
  }

  const d: Date = new Date(data);
  if (d.toString() === 'Invalid Date') {
    throw new Error('Invalid Date');
  }

  return d;
}
