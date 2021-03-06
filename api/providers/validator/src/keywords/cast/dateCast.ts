export function dateCast(data: string | number | Date): Date {
  if (!data) {
    throw new Error('Invalid Date');
  }

  const d: Date = new Date(data);
  if (d.toString() === 'Invalid Date') {
    throw new Error('Invalid Date');
  }

  return d;
}
